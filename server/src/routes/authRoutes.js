import express from 'express';
import { z } from 'zod';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});

const passwordUpdateSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8)
  })
});

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.post('/update-password', authenticate, validate(passwordUpdateSchema), authController.updatePassword);

export default router;
