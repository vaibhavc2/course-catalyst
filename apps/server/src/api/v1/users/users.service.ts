import { RegisterDTO, UserServiceDTO } from '#/common/dtos/user.dto';
import prisma from '#/common/prisma.client';
import redis from '#/common/redis.client';
import { envConfig } from '#/config/env.config';
import { emailService } from '#/services/email.service';
import { jwt } from '#/services/jwt.service';
import { otp } from '#/services/otp.service';
import { ApiError } from '#/utils/api-error.util';
import { wrapAsyncMethodsOfClass } from '#/utils/async-error-handling.util';
import { convertExpiry } from '#/utils/expiry-converter.util';

const { ACTIVATION_TOKEN_EXPIRY } = envConfig;
class UserService {
  async register({ name, email, password }: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Check if user already exists
    if (existingUser)
      throw ApiError.badRequest('User already exists! Please login.');

    // Generate OTP code
    const otpCode = otp.generateSecureOTP(6).string;

    // Generate activation token
    const activationToken = await jwt.generateActivationToken({
      email,
      otpCode,
    });

    // Store activation token in Redis with expiry
    const redisResponse = await redis.setex(
      `activation:${email}`,
      convertExpiry(ACTIVATION_TOKEN_EXPIRY),
      activationToken,
    );

    if (!redisResponse)
      throw ApiError.internal('Activation token failure! Please try again.');

    // Send verification email
    const emailResponse = await emailService.sendVerificationEmail({
      email,
      verificationCode: otpCode,
    });

    if (!emailResponse)
      throw ApiError.internal('Failed to send email! Please try again.');

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    if (!user)
      throw ApiError.internal('Failed to create user. Please try again.');

    return {
      message:
        'Registration successful! Please check your email to activate your account.',
      data: { user },
    };
  }
}

export const userService: UserServiceDTO = wrapAsyncMethodsOfClass(
  new UserService(),
);
