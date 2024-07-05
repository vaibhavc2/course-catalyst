declare global {
  namespace Express {
    type MulterFile = Express.Multer.File;
    type MulterFiles = { [fieldname: string]: Express.Multer.File[] };
    interface Request {
      user?: UserData;
      token?: string;
      file?: MulterFile;
      files?: MulterFiles;
    }
  }
}

export {};
