import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 'Authentication token missing or invalid', 401);
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('-passwordHash -refreshTokenHash').populate('regionId', 'name code state');
    if (!user) {
      return sendError(res, 'User not found or session expired', 401);
    }

    if (!user.active) {
      return sendError(res, 'Account has been deactivated. Please contact Superadmin.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Access token expired', 401, { code: 'TOKEN_EXPIRED' });
    }
    return sendError(res, 'Invalid authentication token', 401);
  }
}
