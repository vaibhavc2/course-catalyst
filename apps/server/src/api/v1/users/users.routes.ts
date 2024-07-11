import { RegisterSchema } from '@/common/schema/register.schema';
import { validation } from '@/middlewares/validation.middleware';
import express from 'express';
import { userController } from './users.controller';

const router = express.Router();

// user registration

router.post(
  '/register',
  validation.requiredFields(['name', 'email', 'password']),
  validation.zod(RegisterSchema),
  userController.register,
);

export default router;
