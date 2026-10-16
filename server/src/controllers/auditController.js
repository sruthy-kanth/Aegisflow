import { AuditLog } from '../models/AuditLog.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function listAuditLogs(req, res, next) {
  try {
    const { action, entity, regionId, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (req.user.role === 'ADMIN') {
      filter.regionId = req.user.regionId?._id || req.user.regionId;
    } else if (regionId) {
      filter.regionId = regionId;
    }

    if (action) filter.action = action;
    if (entity) filter.entity = entity;

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('regionId', 'name code state')
        .sort({ at: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    return sendSuccess(res, {
      logs,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit)
      }
    }, 'Audit logs retrieved');
  } catch (error) {
    next(error);
  }
}
