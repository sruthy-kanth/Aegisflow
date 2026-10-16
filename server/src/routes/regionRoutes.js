import express from 'express';
import { z } from 'zod';
import * as regionController from '../controllers/regionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const createRegionSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(10),
    state: z.string().min(2),
    country: z.string().optional().default('India'),
    description: z.string().optional(),
    centerLocation: z.array(z.number()).length(2), // [lng, lat]
    bounds: z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number()
    }),
    emergencyContacts: z.array(
      z.object({
        title: z.string(),
        phone: z.string(),
        role: z.string().optional()
      })
    ).optional(),
    settings: z.object({
      approvalTimeoutMinutes: z.number().optional(),
      voiceFallbackDelayMinutes: z.number().optional(),
      doorKnockDelayMinutes: z.number().optional(),
      buzzerEnabled: z.boolean().optional()
    }).optional()
  })
});

// All routes require authentication
router.use(authenticate);

// List regions (Superadmin sees all, Admin sees their own)
router.get('/', regionController.listRegions);
router.get('/:id', regionController.getRegionById);

// Create, update, delete regions require SUPERADMIN
router.post('/', requireRole('SUPERADMIN'), validate(createRegionSchema), regionController.createRegion);
router.patch('/:id', requireRole('SUPERADMIN'), regionController.updateRegion);
router.delete('/:id', requireRole('SUPERADMIN'), regionController.deleteRegion);

export default router;
