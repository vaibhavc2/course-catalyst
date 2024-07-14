import {
  ChangePasswordSchema,
  LoginSchema,
  RegisterSchema,
  SendVerificationEmailSchema,
  UpdateUserInfoSchema,
  VerifySchema,
} from '#/common/schema/users.schema';
import { auth } from '#/middlewares/auth.middleware';
import { deviceIdMiddleware } from '#/middlewares/device.middleware';
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
  deviceIdMiddleware,
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
router.post('/verify', validation.zod(VerifySchema), userController.verify);

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
  validation.zod(SendVerificationEmailSchema),
  userController.sendVerificationEmail,
);

/**
 * @openapi
 * /users/refresh:
 *   post:
 *     tags:
 *       - Users
 *     summary: Refresh user token
 *     description: Refresh user token
 *     responses:
 *       200:
 *         description: User token refreshed successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', deviceIdMiddleware, userController.refresh);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     description: Get user profile
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/profile', auth.user(), userController.getProfile);

/**
 * @openapi
 * /users/user-info:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user info
 *     description: Get user info
 *     responses:
 *       200:
 *         description: User info fetched successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/user-info', auth.user(), userController.getUserInfo);

/**
 * @openapi
 * /users/update-info:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user info
 *     description: Update user info
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInfoDTO'
 *     responses:
 *       200:
 *         description: User info updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *      UpdateUserInfoDTO:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *            format: email
 */
router.patch(
  '/update-info',
  validation.zod(UpdateUserInfoSchema),
  auth.user(),
  userController.updateUserInfo,
);

/**
 * @openapi
 * /users/change-password:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Change user password
 *     description: Change user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordDTO'
 *     responses:
 *       200:
 *         description: User password changed successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *      ChangePasswordDTO:
 *        type: object
 *        properties:
 *          currentPassword:
 *            type: string
 *            format: password
 *          newPassword:
 *            type: string
 *            format: password
 *        required:
 *          - currentPassword
 *          - newPassword
 */
router.patch(
  '/change-password',
  validation.requiredFields(['currentPassword', 'newPassword']),
  validation.zod(ChangePasswordSchema),
  auth.user(),
  userController.changePassword,
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
router.delete(
  '/logout',
  auth.user(),
  deviceIdMiddleware,
  userController.logout,
);

/**
 * @openapi
 * /users/logout-all-devices:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Logout user from all devices
 *     description: Logout user from all devices
 *     responses:
 *       200:
 *         description: User logged out from all devices successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete(
  '/logout-all-devices',
  auth.user(),
  userController.logoutAllDevices,
);

export default router;
