import { Prisma, User } from '@prisma/client';

export namespace UserDTO {
  export interface Register {
    email: string;
    password: string;
    name: string;
  }

  export interface Login {
    email: string;
    password: string;
    deviceId: string;
  }

  export interface SendVerificationEmail {
    email: string;
  }

  export interface Verify {
    email: string;
    otpCode: string;
  }

  export interface Logout {
    userId: string;
    deviceId: string;
  }

  export interface LogoutAllDevices {
    userId: string;
  }

  export interface Refresh {
    deviceId: string;
    refreshToken: string;
  }

  export interface GetProfile {
    userId: string;
  }

  export interface UpdateUserInfo {
    userId: string;
    name?: string;
    email?: string;
    prevEmail: string;
    prevName: string;
  }

  export interface ChangePassword {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }
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
