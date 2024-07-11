import { RegisterDTO, UserServiceDTO } from '@/common/dtos/user.dto';
import prisma from '@/common/prisma.client';
import redis from '@/common/redis.client';
import { emailService } from '@/services/email.service';
import { jwt } from '@/services/jwt.service';
import { otp } from '@/services/otp.service';
import { wrapAsyncMethodsOfClass } from '@/utils/async-error-handling.util';

class UserService {
  async register({ name, email, password }: RegisterDTO) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser)
      return {
        success: false,
        message: 'User already exists!',
      };

    const otpCode = otp.generateSecureOTP(6).string;

    const activationToken = await jwt.generateActivationToken({
      email,
      otpCode,
    });

    await redis.set(`activation:${email}`, activationToken);

    await emailService.sendVerificationEmail({
      email,
      verificationCode: otpCode,
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    return {
      success: true,
      message:
        'Registration successful! Please check your email to activate your account.',
      data: {
        user,
      },
    };
  }
}

export const userService: UserServiceDTO = wrapAsyncMethodsOfClass(
  new UserService(),
);
