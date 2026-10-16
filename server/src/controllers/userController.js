import { User } from '../models/User.js';
import { Region } from '../models/Region.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { recordAuditLog } from '../middleware/audit.js';

export async function listUsers(req, res, next) {
  try {
    const { role, regionId } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (regionId) filter.regionId = regionId;

    const users = await User.find(filter)
      .select('-passwordHash -refreshTokenHash')
      .populate('regionId', 'name code state')
      .populate('backupAdminId', 'name email phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { users }, 'Users retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role, regionId, phone, designation, department, backupAdminId } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError(res, 'A user with this email address already exists', 409);
    }

    if (role === 'ADMIN') {
      if (!regionId) {
        return sendError(res, 'Region assignment is required for Regional Admin role', 400);
      }
      const regionExists = await Region.findById(regionId);
      if (!regionExists) {
        return sendError(res, 'Specified region does not exist', 404);
      }
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      regionId: role === 'ADMIN' ? regionId : null,
      phone: phone || '',
      designation: designation || (role === 'SUPERADMIN' ? 'Platform Administrator' : 'District Disaster Management Officer'),
      department: department || 'Disaster Management Authority',
      backupAdminId: backupAdminId || null
    });

    await recordAuditLog({
      actor: req.user,
      action: 'ADMIN_ACCOUNT_CREATED',
      entity: 'User',
      entityId: user._id.toString(),
      regionId: user.regionId,
      after: { email: user.email, name: user.name, role: user.role, regionId: user.regionId },
      req
    });

    const sanitized = user.toObject();
    delete sanitized.passwordHash;
    delete sanitized.refreshTokenHash;

    return sendSuccess(res, { user: sanitized }, 'Admin account created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const beforeState = user.toObject();
    delete beforeState.passwordHash;
    delete beforeState.refreshTokenHash;

    const allowedFields = ['name', 'phone', 'designation', 'department', 'active', 'regionId', 'backupAdminId'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    }

    await user.save();

    const afterState = user.toObject();
    delete afterState.passwordHash;
    delete afterState.refreshTokenHash;

    await recordAuditLog({
      actor: req.user,
      action: 'ADMIN_ACCOUNT_UPDATED',
      entity: 'User',
      entityId: user._id.toString(),
      regionId: user.regionId,
      before: beforeState,
      after: afterState,
      req
    });

    return sendSuccess(res, { user: afterState }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.refreshTokenHash = null; // force re-login
    await user.save();

    await recordAuditLog({
      actor: req.user,
      action: 'ADMIN_PASSWORD_RESET_BY_SUPERADMIN',
      entity: 'User',
      entityId: user._id.toString(),
      regionId: user.regionId,
      req
    });

    return sendSuccess(res, null, `Password for ${user.email} reset successfully`);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (req.user._id.toString() === id) {
      return sendError(res, 'You cannot delete or deactivate your own account', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.active = false;
    user.refreshTokenHash = null;
    await user.save();

    await recordAuditLog({
      actor: req.user,
      action: 'ADMIN_ACCOUNT_DEACTIVATED',
      entity: 'User',
      entityId: user._id.toString(),
      regionId: user.regionId,
      req
    });

    return sendSuccess(res, null, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
}
