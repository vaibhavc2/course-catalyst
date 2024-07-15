import { logger } from '#/common/utils/logger.util';
import { envConfig } from '#/common/config/env.config';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-error-handling.util';
import { convertTimeStr } from '#/common/utils/convert-time-str.util';
import { v2 } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  envConfig;

interface UploadParams {
  localFilePath: string;
  folderName: string;
  width?: number;
  fileType?: 'auto' | 'image' | 'video' | 'raw' | undefined;
  timeout?: string;
}

class CloudinaryService {
  constructor(cloud_name: string, api_key: string, api_secret: string) {
    // configure cloudinary
    v2.config({ cloud_name, api_key, api_secret });
  }

  upload = async ({
    folderName,
    localFilePath,
    width,
    fileType,
    timeout,
  }: UploadParams) => {
    // check if file exists on the local server
    const response = await v2.uploader.upload(localFilePath, {
      resource_type: fileType || 'auto',
      folder: folderName,
      width, //! resize image to width (use only for images)
      timeout: convertTimeStr(timeout || '3m', true),
    });

    logger.info(`=> File is uploaded: ${response.url}`);

    return response;
  };

  delete = async (fileURL: string) => {
    // delete file from cloudinary
    const response = await v2.uploader.destroy(fileURL);

    logger.info(`=> File is deleted from Cloudinary: ${response}`);

    return response;
  };
}

export const cloudinary = wrapAsyncMethodsOfClass(
  new CloudinaryService(
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
  ),
);
