import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../config/logger.js';

export async function recordAuditLog({
  actor = null,
  action,
  entity,
  entityId = null,
  regionId = null,
  before = null,
  after = null,
  req = null,
  metadata = {}
}) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '') : '';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';

    const actorId = actor?._id || req?.user?._id || null;
    const actorName = actor?.name || req?.user?.name || 'System';
    const role = actor?.role || req?.user?.role || 'SYSTEM';
    const logRegionId = regionId || req?.scopedRegionId || req?.user?.regionId?._id || req?.user?.regionId || null;

    const auditEntry = await AuditLog.create({
      actorId,
      actorName,
      role,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      regionId: logRegionId,
      before,
      after,
      ip: String(ip).split(',')[0].trim(),
      userAgent: String(userAgent).substring(0, 255),
      metadata
    });

    return auditEntry;
  } catch (error) {
    logger.error({ err: error }, 'Failed to write audit log entry');
    return null;
  }
}
