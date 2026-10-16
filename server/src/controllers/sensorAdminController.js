import { Sensor } from '../models/Sensor.js';
import { generateSecureToken, hashToken } from '../utils/crypto.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { recordAuditLog } from '../middleware/audit.js';

export async function listSensors(req, res, next) {
  try {
    const { regionId, status, type } = req.query;
    const filter = {};

    if (req.user.role === 'ADMIN') {
      filter.regionId = req.user.regionId?._id || req.user.regionId;
    } else if (regionId) {
      filter.regionId = regionId;
    }

    if (status) filter.status = status;
    if (type) filter.type = type;

    const sensors = await Sensor.find(filter)
      .populate('regionId', 'name code state')
      .populate('zoneId', 'name code')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { sensors }, 'Sensors retrieved');
  } catch (error) {
    next(error);
  }
}

export async function registerSensor(req, res, next) {
  try {
    const { name, deviceId, regionId, zoneId, type, coordinates, elevationMeters, calibrationOffset } = req.body;

    const existing = await Sensor.findOne({ deviceId: deviceId.trim() });
    if (existing) {
      return sendError(res, 'A sensor with this Device ID is already registered', 409);
    }

    // Generate random 32-byte (64 hex char) secret device key
    const rawDeviceKey = `aegis_dev_${generateSecureToken(32)}`;
    const deviceKeyHash = hashToken(rawDeviceKey);

    const sensor = await Sensor.create({
      name,
      deviceId: deviceId.trim(),
      regionId,
      zoneId,
      type,
      location: {
        type: 'Point',
        coordinates // [lng, lat]
      },
      elevationMeters: elevationMeters || 850,
      deviceKeyHash,
      calibrationOffset: calibrationOffset || 0,
      status: 'active',
      battery: 100,
      lastSeenAt: new Date()
    });

    await recordAuditLog({
      actor: req.user,
      action: 'SENSOR_REGISTERED',
      entity: 'Sensor',
      entityId: sensor._id.toString(),
      regionId: sensor.regionId,
      after: { deviceId: sensor.deviceId, type: sensor.type, name: sensor.name },
      req
    });

    return sendSuccess(
      res,
      {
        sensor,
        plainDeviceKey: rawDeviceKey // Only shown once at registration!
      },
      'Sensor registered successfully. Store the generated device API key safely.',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function regenerateSensorKey(req, res, next) {
  try {
    const { id } = req.params;
    const sensor = await Sensor.findById(id);
    if (!sensor) {
      return sendError(res, 'Sensor not found', 404);
    }

    const rawDeviceKey = `aegis_dev_${generateSecureToken(32)}`;
    sensor.deviceKeyHash = hashToken(rawDeviceKey);
    await sensor.save();

    await recordAuditLog({
      actor: req.user,
      action: 'SENSOR_KEY_REGENERATED',
      entity: 'Sensor',
      entityId: sensor._id.toString(),
      regionId: sensor.regionId,
      req
    });

    return sendSuccess(
      res,
      {
        sensorId: sensor._id,
        deviceId: sensor.deviceId,
        plainDeviceKey: rawDeviceKey
      },
      'Device API key rotated successfully. Store the new key safely.'
    );
  } catch (error) {
    next(error);
  }
}

export async function updateSensorStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, calibrationOffset } = req.body;

    const sensor = await Sensor.findById(id);
    if (!sensor) {
      return sendError(res, 'Sensor not found', 404);
    }

    if (status) sensor.status = status;
    if (calibrationOffset !== undefined) sensor.calibrationOffset = calibrationOffset;
    await sensor.save();

    await recordAuditLog({
      actor: req.user,
      action: 'SENSOR_STATUS_UPDATED',
      entity: 'Sensor',
      entityId: sensor._id.toString(),
      regionId: sensor.regionId,
      req
    });

    return sendSuccess(res, { sensor }, 'Sensor status updated');
  } catch (error) {
    next(error);
  }
}
