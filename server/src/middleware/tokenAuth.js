import { hashToken } from '../utils/crypto.js';
import { Household } from '../models/Household.js';
import { Volunteer } from '../models/Volunteer.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Middleware for Household public token access (/h/:token)
 */
export async function authenticateHouseholdToken(req, res, next) {
  try {
    const rawToken = req.params.token || req.headers['x-household-token'];
    if (!rawToken || rawToken.length < 32) {
      return sendError(res, 'Valid household access token is required', 400);
    }

    const hashed = hashToken(rawToken);
    const household = await Household.findOne({ tokenHash: hashed })
      .populate('regionId', 'name code state bounds emergencyContacts settings')
      .populate('zoneId', 'name code currentTier')
      .populate('assignedCampId')
      .populate('primaryRouteId')
      .populate('alternateRouteId');

    if (!household) {
      return sendError(res, 'Invalid or expired household link', 404);
    }

    if (household.tokenRevoked) {
      return sendError(res, 'This link has been revoked or updated. Please contact your local warden.', 403);
    }

    req.household = household;
    req.scopedRegionId = household.regionId?._id?.toString() || household.regionId?.toString();
    next();
  } catch (error) {
    return sendError(res, 'Household token authentication failed', 500, error.message);
  }
}

/**
 * Middleware for Volunteer / Warden public token access (/v/:token or /w/:token)
 */
export function authenticateVolunteerToken(expectedRole = null) {
  return async (req, res, next) => {
    try {
      const rawToken = req.params.token || req.headers['x-volunteer-token'];
      if (!rawToken || rawToken.length < 32) {
        return sendError(res, 'Valid volunteer access token is required', 400);
      }

      const hashed = hashToken(rawToken);
      const volunteer = await Volunteer.findOne({ tokenHash: hashed })
        .populate('regionId', 'name code state')
        .populate('assignedZoneId', 'name code currentTier')
        .populate('assignedRouteId');

      if (!volunteer) {
        return sendError(res, 'Invalid or expired volunteer link', 404);
      }

      if (volunteer.tokenRevoked || !volunteer.active) {
        return sendError(res, 'This volunteer access link is no longer active', 403);
      }

      if (expectedRole && volunteer.role !== expectedRole) {
        return sendError(res, `This link is only valid for ${expectedRole}`, 403);
      }

      req.volunteer = volunteer;
      req.scopedRegionId = volunteer.regionId?._id?.toString() || volunteer.regionId?.toString();
      next();
    } catch (error) {
      return sendError(res, 'Volunteer token authentication failed', 500, error.message);
    }
  };
}
