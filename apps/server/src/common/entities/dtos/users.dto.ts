import { Prisma } from '@prisma/client';

export type UserDTO = Prisma.UserGetPayload<{ include: { avatar: true } }>;
// export type UserDTO = User;
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

export interface RefreshDTO {
  deviceId: string;
  refreshToken: string;
}
