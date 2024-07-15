import { Prisma, User } from '@prisma/client';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  deviceId: string;
}

export interface SendVerificationEmailDTO {
  email: string;
}

export interface VerifyDTO {
  email: string;
  otpCode: string;
}

export interface LogoutDTO {
  userId: string;
  deviceId: string;
}

export interface LogoutAllDevicesDTO {
  userId: string;
}

export interface RefreshDTO {
  deviceId: string;
  refreshToken: string;
}

export interface GetProfileDTO {
  userId: string;
}

export interface UpdateUserInfoDTO {
  userId: string;
  name?: string;
  email?: string;
  prevEmail: string;
  prevName: string;
}

export interface ChangePasswordDTO {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;

export type UserWithAvatarWithoutPassword = Omit<
  Prisma.UserGetPayload<{
    include: {
      avatar: true;
    };
  }>,
  'password'
>;
