import express from 'express';
import { z } from 'zod';
import * as thresholdController from '../controllers/thresholdController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const tierSchema = z.object({
  watch: z.number().min(0),
  warning: z.number().min(0),
  evacuate: z.number().min(0)
});

const templatesSchema = z.object({
  watch: z.string().min(5),
  warning: z.string().min(5),
  evacuate: z.string().min(5)
});

const createThresholdSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    isGlobalDefault: z.boolean().optional(),
    regionId: z.string().optional().nullable(),
    rainfall24h: tierSchema,
    rainfall72h: tierSchema,
    rainfallForecast24h: tierSchema,
    soilMoisturePercent: tierSchema.optional(),
    messageTemplates: z.object({
      en: templatesSchema,
      ml: templatesSchema
    }).optional()
  })
});

router.use(authenticate);

router.get('/', thresholdController.getThresholds);
router.post('/', requireRole('SUPERADMIN'), validate(createThresholdSchema), thresholdController.createThresholdVersion);

export default router;
