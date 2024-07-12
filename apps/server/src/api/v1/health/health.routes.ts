import { healthController } from '#/api/v1/health/health.controller';
import express from 'express';

const router = express.Router();

// app health check
router.get('/', healthController.index);

export default router;
