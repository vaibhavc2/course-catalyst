import {
  LoginDTO,
  RegisterDTO,
  SendVerificationEmailDTO,
  UserServiceDTO,
  VerifyDTO,
} from '#/common/entities/dtos/users.dto';
import { REDIS_KEY_PREFIXES } from '#/common/entities/enums/redis-keys.enums';
import prisma from '#/common/prisma.client';
import redis from '#/common/redis.client';
import { envConfig } from '#/config/env.config';
import { emailService } from '#/services/email.service';
import { jwt } from '#/services/jwt.service';
import { otp } from '#/services/otp.service';
import { pwd } from '#/services/password.service';
import { redisKey } from '#/services/redis-key.service';
import { ApiError } from '#/utils/api-error.util';
import { wrapAsyncMethodsOfClass } from '#/utils/async-error-handling.util';
import { convertExpiry } from '#/utils/expiry-converter.util';

const { ACTIVATION_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = envConfig;

class UserService {
  private async generateActivationTokenAndSendEmail(email: string) {
    // Generate OTP code
    const otpCode = otp.generateSecureOTP(6).string;

    // Generate activation token
    const activationToken = await jwt.generateActivationToken({
      email,
      otpCode,
    });

    // Send verification email
    const emailResponse = await emailService.sendVerificationEmail({
      email,
      verificationCode: otpCode,
    });

    if (!emailResponse)
      throw ApiError.internal('Failed to send email! Please try again.');

    // Store activation token in Redis with expiry
    const redisResponse = await redis.setex(
      redisKey.getActivationKey(email),
      convertExpiry(ACTIVATION_TOKEN_EXPIRY),
      activationToken,
    );

    if (!redisResponse)
      throw ApiError.internal('Activation token failure! Please try again.');

    return true;
  }

  async register({ name, email, password }: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Check if user already exists
    if (existingUser)
      throw ApiError.badRequest('User already exists! Please login.');

    // generate activation token and send email
    if (!(await this.generateActivationTokenAndSendEmail(email)))
      throw ApiError.internal('Internal Error! Please try again.');

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

  async login({ email, password }: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        avatar: true,
      },
    });

    if (!user) throw ApiError.badRequest('User not found! Please register.');

    // Check if password is correct
    const isPasswordCorrect = await pwd.verify(user.password, password);

    if (!isPasswordCorrect)
      throw ApiError.badRequest('Invalid password! Please try again.');

    // Check if user is verified
    if (!user.isVerified)
      throw ApiError.forbidden('Please verify your email first!');

    // Generate access token
    const accessToken = await jwt.generateAccessToken(user.id);

    // Generate refresh token
    const refreshToken = await jwt.generateRefreshToken(user.id);

    // Store refresh token in Redis with expiry (store session)
    await redis.setex(
      redisKey.getSessionKey(user.id),
      convertExpiry(REFRESH_TOKEN_EXPIRY),
      refreshToken,
    );

    return {
      message: 'User logged in successfully!',
      data: { user, tokens: { accessToken, refreshToken } },
    };
  }

  async sendVerificationEmail({ email }: SendVerificationEmailDTO) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw ApiError.badRequest('User not found! Please register.');

    // Check if user is already verified
    if (user.isVerified)
      throw ApiError.badRequest('User already verified! Please login.');

    // generate activation token and send email
    if (!(await this.generateActivationTokenAndSendEmail(email)))
      throw ApiError.internal('Internal Error! Please try again.');

    return {
      message: 'Verification email sent successfully!',
      data: { email: user.email },
    };
  }

  async verify({ email, otpCode }: VerifyDTO) {
    // Get activation token from Redis
    const activationToken = await redis.get(redisKey.getActivationKey(email));

    if (!activationToken)
      throw ApiError.badRequest('Activation token expired! Please try again.');

    // Verify activation token
    const { email: tokenEmail, otpCode: tokenOtpCode } =
      (await jwt.verifyActivationToken(activationToken)) ?? {};

    if (!tokenEmail || !tokenOtpCode)
      throw ApiError.badRequest('Invalid activation token! Please try again.');

    // Check if email and OTP code match
    if (email !== tokenEmail || otpCode !== String(tokenOtpCode))
      throw ApiError.badRequest('Invalid email or OTP code! Please try again.');

    // Update user verification status
    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        isVerified: true,
      },
    });

    if (!user)
      throw ApiError.internal('Failed to verify user! Please try again.');

    // Delete activation token from Redis
    await redis.del(`${REDIS_KEY_PREFIXES.ACTIVATION}${email}`);

    return {
      message: 'User verified successfully!',
      data: { user },
    };
  }

  async logout(userId: string) {
    // Delete refresh token from Redis
    await redis.del(redisKey.getSessionKey(userId));

    return {
      message: 'Logged out successfully!',
      data: null,
    };
  }
}

export const userService: UserServiceDTO = wrapAsyncMethodsOfClass(
  new UserService(),
);
