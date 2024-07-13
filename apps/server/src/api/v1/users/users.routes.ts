import { LoginSchema, RegisterSchema } from '#/common/schema/users.schema';
import { validation } from '#/middlewares/validation.middleware';
import express from 'express';
import { userController } from './users.controller';
import { auth } from '#/middlewares/auth.middleware';

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

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login a user
 *     description: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDTO'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *      LoginDTO:
 *        type: object
 *        properties:
 *          email:
 *            type: string
 *            format: email
 *          password:
 *            type: string
 *            format: password
 *        required:
 *          - email
 *          - password
 */
router.post(
  '/login',
  validation.requiredFields(['email', 'password']),
  validation.zod(LoginSchema),
  userController.login,
);

/**
 * @openapi
 * /users/verify:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verify a user
 *     description: Verify a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyDTO'
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *      VerifyDTO:
 *        type: object
 *        properties:
 *          email:
 *            type: string
 *            format: email
 *          otpCode:
 *            type: string
 *        required:
 *          - email
 *          - otpCode
 */
router.post(
  '/verify',
  validation.requiredFields(['email', 'otpCode']),
  userController.verify,
);

/**
 * @openapi
 * /users/send-verification-email:
 *   post:
 *     tags:
 *       - Users
 *     summary: Send verification email
 *     description: Send verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendVerificationEmailDTO'
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *      SendVerificationEmailDTO:
 *        type: object
 *        properties:
 *          email:
 *            type: string
 *            format: email
 *        required:
 *          - email
 */
router.post(
  '/send-verification-email',
  validation.requiredFields(['email']),
  userController.sendVerificationEmail,
);

/**
 * @openapi
 * /users/logout:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Logout a user
 *     description: Logout a user
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete('/logout', auth.user(), userController.logout);

export default router;
