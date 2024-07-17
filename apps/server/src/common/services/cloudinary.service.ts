import envConfig from '#/common/config/env.config';
import { convertTimeStr } from '#/common/utils/time.util';
import { v2 } from 'cloudinary';
import fs from 'fs';
import ApiError from '../utils/api-error.util';

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
    // Upload file to cloudinary
    const response = await v2.uploader.upload(localFilePath, {
      resource_type: fileType || 'auto',
      folder: folderName,
      width, //! resize image to width (use only for images)
      timeout: convertTimeStr(timeout || '3m', true),
    });

    // Check if file is uploaded
    if (!response.url || !response.public_id || !response.secure_url) {
      throw ApiError.internal('Failed to upload file!');
    }

    // Delete file from local storage
    fs.unlinkSync(localFilePath);

    return response;
  };

  delete = async (public_id: string) => {
    // Delete file from cloudinary
    const response = await v2.uploader.destroy(public_id);

    return response;
  };
}

const cloudinaryService = new CloudinaryService(
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
);
export default cloudinaryService;
