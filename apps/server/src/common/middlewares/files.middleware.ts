import { ct } from '#/common/constants';
import { cloudinary } from '#/common/services/cloudinary.service';
import { ApiError } from '#/common/utils/api-error.util';
import { asyncErrorHandler } from '#/common/utils/async-error-handling.util';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

type ImageName = 'Avatar' | 'Image' | 'Course'; // Add more image names here later

class FilesMiddleware {
  private multerUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'temp/uploads');
      },
      filename: function (req, file, cb) {
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
      },
    }),
  }).any();

  private multerPromise = (req: Request, res: Response) => {
    return new Promise((resolve, reject) => {
      this.multerUpload(req, res, (err) => {
        if (!err) resolve(req);
        reject(err);
      });
    });
  };

  public multer = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await this.multerPromise(req, res);
        next();
      } catch (err) {
        next(err);
      }
    },
  );

  public uploadImageToCloudinary = (imgName: ImageName = 'Image') =>
    asyncErrorHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        // get image local path
        const imageLocalPath = req.file?.path;

        // check if image file is missing
        if (!imageLocalPath) {
          throw ApiError.badRequest(`Missing ${imgName} file!`);
        }

        // check if image is a valid image file
        if (!ct.mimeTypes.image.includes(req.file?.mimetype as string)) {
          throw ApiError.badRequest(`Invalid ${imgName} file type!`);
        }

        // upload image to cloudinary
        const image = await cloudinary.upload({
          localFilePath: imageLocalPath,
          folderName: 'avatars',
        });

        // check if image upload failed
        if (!image?.secure_url) {
          throw ApiError.internal('Failed to upload image!');
        }

        const { secure_url, public_id } = image;

        // save image url to request body
        req.image = { url: secure_url, public_id };

        // next middleware
        next();
      },
    );
}

export const filesMiddleware = new FilesMiddleware();
