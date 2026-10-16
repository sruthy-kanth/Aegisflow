import express from 'express';
import * as auditController from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', auditController.listAuditLogs);

export default router;
