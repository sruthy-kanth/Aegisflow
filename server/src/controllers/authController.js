import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashToken } from '../utils/crypto.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { recordAuditLog } from '../middleware/audit.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).populate('regionId', 'name code state bounds');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.active) {
      return sendError(res, 'Account deactivated. Please contact an administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Generate tokens
    const tokenPayload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      regionId: user.regionId?._id ? user.regionId._id.toString() : null
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user._id.toString() });

    // Store hashed refresh token in database
    user.refreshTokenHash = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    await recordAuditLog({
      actor: user,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      req,
      after: { email: user.email, role: user.role }
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          regionId: user.regionId,
          designation: user.designation,
          department: user.department
        },
        accessToken
      },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!rawRefreshToken) {
      return sendError(res, 'Refresh token required', 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (err) {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.id).populate('regionId', 'name code state bounds');
    if (!user || !user.active) {
      return sendError(res, 'User session invalid', 401);
    }

    const hashed = hashToken(rawRefreshToken);
    if (user.refreshTokenHash !== hashed) {
      return sendError(res, 'Invalid refresh token session', 401);
    }

    // Generate new access token
    const tokenPayload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      regionId: user.regionId?._id ? user.regionId._id.toString() : null
    };

    const newAccessToken = signAccessToken(tokenPayload);

    return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshTokenHash: null });
      await recordAuditLog({
        actor: req.user,
        action: 'USER_LOGOUT',
        entity: 'User',
        entityId: req.user._id.toString(),
        req
      });
    }

    res.clearCookie('refreshToken');
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    return sendSuccess(res, { user: req.user }, 'Current user profile');
  } catch (error) {
    next(error);
  }
}

export async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password incorrect', 400);
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.refreshTokenHash = null; // Invalidate other sessions
    await user.save();

    await recordAuditLog({
      actor: req.user,
      action: 'PASSWORD_UPDATED',
      entity: 'User',
      entityId: user._id.toString(),
      req
    });

    return sendSuccess(res, null, 'Password updated successfully. Please login again if needed.');
  } catch (error) {
    next(error);
  }
}
