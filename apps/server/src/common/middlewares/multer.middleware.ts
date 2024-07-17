import multer, { Multer, StorageEngine } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { asyncErrorHandler } from '../utils/async-errors.util';

interface SingleOptions {
  fieldName: string;
}

interface ArrayOptions {
  fieldName: string;
  maxCount: number;
}

interface FieldOptions {
  name: string;
  maxCount?: number;
}

interface FieldsOptions {
  fields: FieldOptions[];
}

type MulterOptions = SingleOptions | ArrayOptions | FieldsOptions | undefined;

class MulterService {
  private storage: StorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'temp/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    },
  });

  private multerInstance: Multer = multer({ storage: this.storage });

  private multerPromise(
    upload: (
      req: Request,
      res: Response,
      callback: (error: any) => void,
    ) => void,
    req: Request,
    res: Response,
  ): Promise<Request> {
    return new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (!err) resolve(req);
        else reject(err);
      });
    });
  }

  public multer(
    uploadMethod: 'single',
    options: SingleOptions,
  ): (req: Request, res: Response, next: NextFunction) => void;
  public multer(
    uploadMethod: 'array',
    options: ArrayOptions,
  ): (req: Request, res: Response, next: NextFunction) => void;
  public multer(
    uploadMethod: 'fields',
    options: FieldsOptions,
  ): (req: Request, res: Response, next: NextFunction) => void;
  public multer(
    uploadMethod: 'any' | 'none',
  ): (req: Request, res: Response, next: NextFunction) => void;

  public multer(
    uploadMethod: 'single' | 'array' | 'fields' | 'any' | 'none',
    options?: MulterOptions,
  ) {
    return asyncErrorHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        let upload;
        switch (uploadMethod) {
          case 'single':
            upload = this.multerInstance.single(
              (options as SingleOptions).fieldName,
            );
            break;
          case 'array':
            upload = this.multerInstance.array(
              (options as ArrayOptions).fieldName,
              (options as ArrayOptions).maxCount,
            );
            break;
          case 'fields':
            upload = this.multerInstance.fields(
              (options as FieldsOptions).fields,
            );
            break;
          case 'any':
            upload = this.multerInstance.any();
            break;
          case 'none':
            upload = this.multerInstance.none();
            break;
          default:
            throw new Error('Invalid upload method');
        }

        try {
          await this.multerPromise(upload, req, res);
          next();
        } catch (err) {
          next(err);
        }
      },
    );
  }
}

const multerService = new MulterService();
export default multerService;
