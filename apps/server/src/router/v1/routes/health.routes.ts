import { healthController } from '@/api/health/health.controller';
import express from 'express';

const router = express.Router();

// app health check
router.get('/', healthController.index);

// router.get('/:text', healthController.index);

export default router;
