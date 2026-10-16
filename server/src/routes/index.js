import express from 'express';
import authRoutes from './authRoutes.js';
import regionRoutes from './regionRoutes.js';
import userRoutes from './userRoutes.js';
import thresholdRoutes from './thresholdRoutes.js';
import sensorAdminRoutes from './sensorAdminRoutes.js';
import systemRoutes from './systemRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/regions', regionRoutes);
router.use('/users', userRoutes);
router.use('/thresholds', thresholdRoutes);
router.use('/sensors', sensorAdminRoutes);
router.use('/system', systemRoutes);
router.use('/audit', auditRoutes);

export default router;
