import { ct } from '#/common/constants';
import ApiError from '#/common/utils/api-error.util';
import { asyncErrorHandler } from '#/common/utils/async-errors.util';
import { NextFunction, Request, Response } from 'express';
import cloudinaryService from '../services/cloudinary.service';

type ImageName = 'avatar' | 'image' | 'course'; // Add more image names here later

class UploadMiddleware {
  image = (imgName: ImageName = 'image') =>
    asyncErrorHandler(async function (
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      // get image local path
      const imageLocalPath = req.file?.path;

      const capitalisedImgName =
        imgName.charAt(0).toLocaleUpperCase() + imgName.slice(1);

      // check if image file is missing
      if (!imageLocalPath) {
        throw ApiError.badRequest(`Missing ${capitalisedImgName} file!`);
      }

      // check if image is a valid image file
      if (!ct.mimeTypes.image.includes(req.file?.mimetype as string)) {
        throw ApiError.badRequest(`Invalid ${capitalisedImgName} file type!`);
      }

      // upload image to cloudinary
      const image = await cloudinaryService.upload({
        localFilePath: imageLocalPath,
        folderName: imgName,
        width: 500,
      });

      // check if image upload failed
      if (!image?.secure_url) {
        throw ApiError.internal('Failed to upload image!');
      }

      const { secure_url, public_id } = image;

      // save image url to request body
      if (imgName === 'avatar') {
        req.avatar = { url: secure_url, public_id };
      }
      // else if (imgName === 'Image') {
      //   req.image = { url: secure_url, public_id };
      // } else if (imgName === 'Course') {
      //   req.courseImage = { url: secure_url, public_id };
      // }

      // next middleware
      next();
    });
}

export const uploadMiddleware = new UploadMiddleware();
