import { RegisterSchema } from '@/common/schema/register.schema';
import { validation } from '@/middlewares/validation.middleware';
import express from 'express';
import { userController } from './user.controller';

const router = express.Router();

// user registration
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registers a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *              email:
 *                type: string
 *             password:
 *              type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *       description: Bad request
 */
router.post(
  '/register',
  validation.requiredFields(['name', 'email', 'password']),
  validation.zod(RegisterSchema),
  userController.register,
);

export default router;
