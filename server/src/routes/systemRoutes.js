import express from 'express';
import { z } from 'zod';
import * as systemHealthController from '../controllers/systemHealthController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const updateProviderSchema = z.object({
  body: z.object({
    smsProvider: z.enum(['mock', 'twilio', 'msg91']).optional(),
    voiceProvider: z.enum(['mock', 'twilio']).optional(),
    buzzerGatewayUrl: z.string().url().optional()
  })
});

// Mock buzzer endpoint for local simulation
router.post('/mock/buzzer', systemHealthController.mockBuzzerEndpoint);

// Protected routes
router.use(authenticate);

router.get('/health', systemHealthController.getSystemHealth);
router.get('/providers', requireRole('SUPERADMIN'), systemHealthController.getProviderSettings);
router.patch('/providers', requireRole('SUPERADMIN'), validate(updateProviderSchema), systemHealthController.updateProviderSettings);

export default router;
