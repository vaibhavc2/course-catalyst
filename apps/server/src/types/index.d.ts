import { Prisma, User } from '@prisma/client';

declare global {
  namespace Express {
    type MulterFile = Express.Multer.File;
    type MulterFiles = { [fieldname: string]: Express.Multer.File[] };
    interface Request {
      user?: Omit<User, 'password'>;
      token?: string;
      deviceId?: string;
      file?: MulterFile;
      files?: MulterFiles;
    }
  }
}

// Other global types
interface StandardResponseDTO<T> {
  message: string;
  status?: number;
  data?: T | null;
}

type RequestCookie = { [key: string]: string };

export { RequestCookie, StandardResponseDTO };
