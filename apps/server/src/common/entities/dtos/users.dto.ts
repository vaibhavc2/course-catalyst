import { StandardResponse } from '#/types';
import { Prisma, User } from '@prisma/client';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface SendVerificationEmailDTO {
  email: string;
}

export interface VerifyDTO {
  email: string;
  otpCode: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

type UserDTO = Prisma.UserGetPayload<{ include: { avatar: true } }>;
// export type UserDTO = User;

export interface UserServiceDTO {
  register: (data: RegisterDTO) => Promise<StandardResponse<{ user: User }>>;
  login: (
    data: LoginDTO,
  ) => Promise<StandardResponse<{ user: UserDTO; tokens: Tokens }>>;
  sendVerificationEmail: (
    data: SendVerificationEmailDTO,
  ) => Promise<StandardResponse<{ email: string }>>;
  verify: (data: VerifyDTO) => Promise<StandardResponse<{ user: User }>>;
  logout: (userId: string) => Promise<StandardResponse<null>>;
}
