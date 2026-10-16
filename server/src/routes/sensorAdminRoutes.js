import express from 'express';
import { z } from 'zod';
import * as sensorAdminController from '../controllers/sensorAdminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const registerSensorSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    deviceId: z.string().min(3),
    regionId: z.string(),
    zoneId: z.string(),
    type: z.enum(['rain', 'soil']),
    coordinates: z.array(z.number()).length(2), // [lng, lat]
    elevationMeters: z.number().optional(),
    calibrationOffset: z.number().optional()
  })
});

router.use(authenticate);

// View sensors (superadmin or regional admin)
router.get('/', sensorAdminController.listSensors);

// Registration & Key generation requires SUPERADMIN
router.post('/', requireRole('SUPERADMIN'), validate(registerSensorSchema), sensorAdminController.registerSensor);
router.post('/:id/regenerate-key', requireRole('SUPERADMIN'), sensorAdminController.regenerateSensorKey);
router.patch('/:id', requireRole('SUPERADMIN'), sensorAdminController.updateSensorStatus);

export default router;
