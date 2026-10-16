import { ThresholdConfig } from '../models/ThresholdConfig.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { recordAuditLog } from '../middleware/audit.js';

export async function getThresholds(req, res, next) {
  try {
    const { regionId } = req.query;

    // Fetch active global default config
    const globalDefault = await ThresholdConfig.findOne({ isGlobalDefault: true, active: true }).sort({ version: -1 });

    let regionConfig = null;
    if (regionId) {
      regionConfig = await ThresholdConfig.findOne({ regionId, active: true }).sort({ version: -1 });
    } else if (req.user.role === 'ADMIN' && req.user.regionId) {
      const adminRegionId = req.user.regionId._id || req.user.regionId;
      regionConfig = await ThresholdConfig.findOne({ regionId: adminRegionId, active: true }).sort({ version: -1 });
    }

    const history = await ThresholdConfig.find({
      ...(regionId ? { regionId } : { isGlobalDefault: true })
    }).sort({ version: -1 }).limit(10);

    return sendSuccess(res, {
      activeConfig: regionConfig || globalDefault,
      globalDefault,
      regionConfig,
      history
    }, 'Threshold configurations retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createThresholdVersion(req, res, next) {
  try {
    const {
      name,
      description,
      isGlobalDefault,
      regionId,
      rainfall24h,
      rainfall72h,
      rainfallForecast24h,
      soilMoisturePercent,
      messageTemplates
    } = req.body;

    // Find the latest version number
    const latest = await ThresholdConfig.findOne({
      ...(isGlobalDefault ? { isGlobalDefault: true } : { regionId })
    }).sort({ version: -1 });

    const newVersion = (latest?.version || 0) + 1;

    // If making this active, deactivate earlier ones of this scope
    if (isGlobalDefault) {
      await ThresholdConfig.updateMany({ isGlobalDefault: true }, { active: false });
    } else if (regionId) {
      await ThresholdConfig.updateMany({ regionId }, { active: false });
    }

    const config = await ThresholdConfig.create({
      version: newVersion,
      name,
      description: description || `Version ${newVersion} created by ${req.user.name}`,
      isGlobalDefault: Boolean(isGlobalDefault),
      regionId: isGlobalDefault ? null : regionId,
      rainfall24h,
      rainfall72h,
      rainfallForecast24h,
      soilMoisturePercent: soilMoisturePercent || { watch: 70, warning: 85, evacuate: 95 },
      messageTemplates: messageTemplates || latest?.messageTemplates,
      createdBy: req.user._id,
      active: true
    });

    await recordAuditLog({
      actor: req.user,
      action: isGlobalDefault ? 'GLOBAL_THRESHOLDS_UPDATED' : 'REGIONAL_THRESHOLDS_UPDATED',
      entity: 'ThresholdConfig',
      entityId: config._id.toString(),
      regionId: config.regionId,
      after: config.toObject(),
      req
    });

    return sendSuccess(res, { config }, `Threshold Configuration Version ${newVersion} published`, 201);
  } catch (error) {
    next(error);
  }
}
