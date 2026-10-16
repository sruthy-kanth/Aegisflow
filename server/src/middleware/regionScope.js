import { sendError } from '../utils/apiResponse.js';

export function enforceRegionScope(options = { requireExplicitRegion: false }) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (req.user.role === 'ADMIN') {
      const adminRegionId = req.user.regionId?._id 
        ? req.user.regionId._id.toString() 
        : req.user.regionId?.toString();

      if (!adminRegionId) {
        return sendError(res, 'Admin account has no assigned region', 403);
      }

      // Check if client tried to request a different region in params, query, or body
      const requestedRegionId = req.params?.regionId || req.query?.regionId || req.body?.regionId || req.headers?.['x-region-id'];

      if (requestedRegionId && requestedRegionId !== adminRegionId) {
        return sendError(res, 'Access denied: You are only authorized to access your assigned region', 403);
      }

      // Enforce the user's assigned region
      req.scopedRegionId = adminRegionId;
      return next();
    }

    if (req.user.role === 'SUPERADMIN') {
      const explicitRegionId = req.params?.regionId || req.query?.regionId || req.body?.regionId || req.headers?.['x-region-id'];
      if (options.requireExplicitRegion && !explicitRegionId) {
        return sendError(res, 'regionId parameter is required for this operation', 400);
      }
      req.scopedRegionId = explicitRegionId || null;
      return next();
    }

    return sendError(res, 'Unauthorized role', 403);
  };
}
