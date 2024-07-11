import { StandardResponse } from '@/types';
import { Prisma, User } from '@prisma/client';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

type UserDTO = Prisma.UserGetPayload<{ include: { avatar: true } }>;
// export type UserDTO = User;

export interface UserServiceDTO {
  register: (data: RegisterDTO) => Promise<StandardResponse<{ user: User }>>;
}
