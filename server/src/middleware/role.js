import { sendError } from '../utils/apiResponse.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, `Forbidden: Requires role [${allowedRoles.join(', ')}]`, 403);
    }

    next();
  };
}
