import { User } from '@prisma/client';

declare global {
  namespace Express {
    type MulterFile = Express.Multer.File;
    type MulterFiles = { [fieldname: string]: Express.Multer.File[] };
    interface Request {
      user?: User;
      token?: string;
      file?: MulterFile;
      files?: MulterFiles;
    }
  }
}

// Other global types
interface StandardResponse<T> {
  message: string;
  status?: number;
  data?: T | null;
}

export { StandardResponse };
