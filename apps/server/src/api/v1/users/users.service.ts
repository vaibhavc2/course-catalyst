import {
  LoginDTO,
  LogoutDTO,
  RefreshDTO,
  RegisterDTO,
  SendVerificationEmailDTO,
  UserDTO,
  VerifyDTO,
} from '#/common/entities/dtos/users.dto';
import { JWTTOKENS } from '#/common/entities/enums/jwt.tokens';
import { REDIS_KEY_PREFIXES } from '#/common/entities/enums/redis-keys.enums';
import prisma from '#/common/prisma.client';
import { envConfig } from '#/config/env.config';
import { emailService } from '#/services/email.service';
import { jwt } from '#/services/jwt.service';
import { otp } from '#/services/otp.service';
import { pwd } from '#/services/password.service';
import { RedisService, redisService } from '#/services/redis.service';
import { StandardResponseDTO } from '#/types';
import { ApiError } from '#/utils/api-error.util';
import { wrapAsyncMethodsOfClass } from '#/utils/async-error-handling.util';
import { convertExpiry } from '#/utils/expiry-converter.util';
import { User } from '@prisma/client';

const { ACTIVATION_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, ACCESS_TOKEN_EXPIRY } =
  envConfig;

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface UserServiceDTO {
  register: (data: RegisterDTO) => Promise<StandardResponseDTO<{ user: User }>>;
  login: (
    data: LoginDTO,
  ) => Promise<StandardResponseDTO<{ user: UserDTO; tokens: Tokens }>>;
  sendVerificationEmail: (
    data: SendVerificationEmailDTO,
  ) => Promise<StandardResponseDTO<{ email: string }>>;
  verify: (data: VerifyDTO) => Promise<StandardResponseDTO<{ user: User }>>;
  logout: (data: LogoutDTO) => Promise<StandardResponseDTO<null>>;
  refresh: (
    data: RefreshDTO,
  ) => Promise<StandardResponseDTO<{ tokens: Tokens }>>;
}

class UserService implements UserServiceDTO {
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
    const redisResponse = await redisService.setex(
      RedisService.createKey('ACTIVATION', email),
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

  async login({ email, password, deviceId }: LoginDTO) {
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
    const accessToken = await jwt.generateAccessToken({ userId: user.id });

    // Generate refresh token
    const refreshToken = await jwt.generateRefreshToken({ userId: user.id });

    // Store refresh token in Redis with expiry (store session)
    await redisService.hmset_with_expiry(
      RedisService.createKey('SESSION', user.id, deviceId),
      convertExpiry(REFRESH_TOKEN_EXPIRY),
      {
        deviceId: deviceId,
        refreshToken: refreshToken,
      },
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
    const activationTokenKey = RedisService.createKey('ACTIVATION', email);
    const activationToken = await redisService.get(activationTokenKey);

    if (!activationToken)
      throw ApiError.badRequest('Activation token expired! Please try again.');

    // Verify activation token
    const {
      email: tokenEmail,
      otpCode: tokenOtpCode,
      type,
    } = (await jwt.verifyActivationToken(activationToken)) ?? {};

    if (!tokenEmail || !tokenOtpCode || type !== JWTTOKENS.ACTIVATION)
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
    await redisService.del(activationTokenKey);

    return {
      message: 'User verified successfully!',
      data: { user },
    };
  }

  async logout({ deviceId, userId }: LogoutDTO) {
    // Delete refresh token from Redis
    await redisService.del(RedisService.createKey('SESSION', userId, deviceId));

    return {
      message: 'Logged out successfully!',
      data: null,
    };
  }

  async refresh({ deviceId, refreshToken }: RefreshDTO) {
    // Verify refresh token
    const { userId, type } = (await jwt.verifyRefreshToken(refreshToken)) ?? {};

    if (!userId || type !== JWTTOKENS.REFRESH)
      throw ApiError.unauthorized('Invalid token! Please login.');

    // Check if session exists in Redis
    const sessionKey = RedisService.createKey('SESSION', userId, deviceId);
    const session = await redisService.hmget(sessionKey);

    if (!session) throw ApiError.unauthorized('Session expired! Please login.');

    // Check if device ID matches
    if (session[0] !== deviceId)
      throw ApiError.unauthorized('Invalid device! Please login.');

    // Check if refresh token matches
    if (session[1] !== refreshToken)
      throw ApiError.unauthorized('Invalid token! Please login.');

    // Delete old refresh token
    await redisService.del(sessionKey);

    // Generate new access token
    const accessToken = await jwt.generateAccessToken({ userId });

    // Generate new refresh token
    const newRefreshToken = await jwt.generateRefreshToken({ userId });

    // Store new refresh token in Redis with expiry (store session)
    await redisService.hmset_with_expiry(
      sessionKey,
      convertExpiry(REFRESH_TOKEN_EXPIRY),
      {
        deviceId: deviceId,
        refreshToken: refreshToken,
      },
    );

    return {
      message: 'Token refreshed successfully!',
      data: { tokens: { accessToken, refreshToken: newRefreshToken } },
    };
  }

  async logoutAllDevices({ userId }: { userId: string }) {
    // Delete all sessions of user from Redis
    await redisService.del_keys(RedisService.createKey('SESSION', userId, '*'));

    // Store the current timestamp in Redis (to invalidate access tokens)
    await redisService.setex(
      RedisService.createKey('INVALIDATED', userId),
      convertExpiry(ACCESS_TOKEN_EXPIRY),
      Date.now().toString(),
    );

    return {
      message: 'Logged out from all devices successfully!',
      data: null,
    };
  }
}

export const userService = wrapAsyncMethodsOfClass(new UserService());
