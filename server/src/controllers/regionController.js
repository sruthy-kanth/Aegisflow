import { Region } from '../models/Region.js';
import { User } from '../models/User.js';
import { Zone } from '../models/Zone.js';
import { Camp } from '../models/Camp.js';
import { Household } from '../models/Household.js';
import { Sensor } from '../models/Sensor.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { recordAuditLog } from '../middleware/audit.js';

export async function listRegions(req, res, next) {
  try {
    const filter = {};
    // If regional admin, restrict list to their assigned region
    if (req.user.role === 'ADMIN') {
      filter._id = req.user.regionId?._id || req.user.regionId;
    }

    const regions = await Region.find(filter).sort({ name: 1 }).lean();

    // Attach basic counters for each region
    const enhancedRegions = await Promise.all(
      regions.map(async (r) => {
        const [zoneCount, householdCount, campCount, sensorCount, adminCount] = await Promise.all([
          Zone.countDocuments({ regionId: r._id }),
          Household.countDocuments({ regionId: r._id }),
          Camp.countDocuments({ regionId: r._id }),
          Sensor.countDocuments({ regionId: r._id }),
          User.countDocuments({ regionId: r._id, role: 'ADMIN' })
        ]);
        return {
          ...r,
          stats: {
            zones: zoneCount,
            households: householdCount,
            camps: campCount,
            sensors: sensorCount,
            admins: adminCount
          }
        };
      })
    );

    return sendSuccess(res, { regions: enhancedRegions }, 'Regions retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getRegionById(req, res, next) {
  try {
    const { id } = req.params;

    if (req.user.role === 'ADMIN') {
      const adminRegionId = req.user.regionId?._id ? req.user.regionId._id.toString() : req.user.regionId?.toString();
      if (adminRegionId !== id) {
        return sendError(res, 'Access denied to this region', 403);
      }
    }

    const region = await Region.findById(id).lean();
    if (!region) {
      return sendError(res, 'Region not found', 404);
    }

    const admins = await User.find({ regionId: id, role: 'ADMIN' }).select('-passwordHash -refreshTokenHash').lean();
    const zones = await Zone.find({ regionId: id }).lean();

    return sendSuccess(res, { region, admins, zones }, 'Region details');
  } catch (error) {
    next(error);
  }
}

export async function createRegion(req, res, next) {
  try {
    const { name, code, state, country, description, centerLocation, bounds, emergencyContacts, settings } = req.body;

    const existing = await Region.findOne({ $or: [{ code: code.toUpperCase() }, { name }] });
    if (existing) {
      return sendError(res, 'A region with this name or code already exists', 409);
    }

    const region = await Region.create({
      name,
      code: code.toUpperCase(),
      state,
      country: country || 'India',
      description,
      centerLocation: {
        type: 'Point',
        coordinates: centerLocation // [lng, lat]
      },
      bounds,
      emergencyContacts: emergencyContacts || [],
      settings: settings || {}
    });

    await recordAuditLog({
      actor: req.user,
      action: 'REGION_CREATED',
      entity: 'Region',
      entityId: region._id.toString(),
      regionId: region._id,
      after: region.toObject(),
      req
    });

    return sendSuccess(res, { region }, 'Region created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateRegion(req, res, next) {
  try {
    const { id } = req.params;
    const region = await Region.findById(id);
    if (!region) {
      return sendError(res, 'Region not found', 404);
    }

    const beforeState = region.toObject();

    const allowedFields = ['name', 'description', 'state', 'country', 'centerLocation', 'bounds', 'emergencyContacts', 'settings', 'active'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'centerLocation' && Array.isArray(req.body[field])) {
          region.centerLocation = { type: 'Point', coordinates: req.body[field] };
        } else {
          region[field] = req.body[field];
        }
      }
    }

    await region.save();

    await recordAuditLog({
      actor: req.user,
      action: 'REGION_UPDATED',
      entity: 'Region',
      entityId: region._id.toString(),
      regionId: region._id,
      before: beforeState,
      after: region.toObject(),
      req
    });

    return sendSuccess(res, { region }, 'Region updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteRegion(req, res, next) {
  try {
    const { id } = req.params;
    const region = await Region.findById(id);
    if (!region) {
      return sendError(res, 'Region not found', 404);
    }

    // Deactivate instead of hard delete to preserve historical integrity
    region.active = false;
    await region.save();

    await recordAuditLog({
      actor: req.user,
      action: 'REGION_DEACTIVATED',
      entity: 'Region',
      entityId: region._id.toString(),
      regionId: region._id,
      req
    });

    return sendSuccess(res, { region }, 'Region deactivated successfully');
  } catch (error) {
    next(error);
  }
}
