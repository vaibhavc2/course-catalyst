import { Prisma } from '@prisma/client';

export type AvatarImage = Prisma.AvatarGetPayload<{
  select: { url: true; public_id: true };
}>;

export namespace AvatarDTO {
  export interface Upload {
    avatar: AvatarImage;
    userId: string;
  }

  export interface Delete {
    userId: string;
  }

  export interface Get {
    userId: string;
  }
}
