import { RegisterSchema } from '#/common/schema/register.schema';
import { validation } from '#/middlewares/validation.middleware';
import express from 'express';
import { userController } from './users.controller';

const router = express.Router();

/**
 * @openapi
 * /users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDTO'
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *      RegisterDTO:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *            format: email
 *          password:
 *            type: string
 *            format: password
 *        required:
 *          - name
 *          - email
 *          - password
 */
router.post(
  '/register',
  validation.requiredFields(['name', 'email', 'password']),
  validation.zod(RegisterSchema),
  userController.register,
);

export default router;
