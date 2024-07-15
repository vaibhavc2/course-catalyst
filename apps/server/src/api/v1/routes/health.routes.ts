import { healthController } from '#/api/v1/controllers/health.controller';
import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check the health of the API - http, db, disk, memory
 *     description: Check the health of the API - http, db, disk, memory
 *     responses:
 *       200:
 *         description: Health check passed
 *       503:
 *         description: Health check failed
 */
router.get('/', healthController.index);

export default router;
