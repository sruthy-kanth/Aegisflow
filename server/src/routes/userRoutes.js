import express from 'express';
import { z } from 'zod';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['SUPERADMIN', 'ADMIN']),
    regionId: z.string().optional().nullable(),
    phone: z.string().optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
    backupAdminId: z.string().optional().nullable()
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8)
  })
});

router.use(authenticate);
router.use(requireRole('SUPERADMIN'));

router.get('/', userController.listUsers);
router.post('/', validate(createUserSchema), userController.createUser);
router.patch('/:id', userController.updateUser);
router.post('/:id/reset-password', validate(resetPasswordSchema), userController.resetUserPassword);
router.delete('/:id', userController.deleteUser);

export default router;
