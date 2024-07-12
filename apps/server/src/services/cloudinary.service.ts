// import env from '#/config';
// import {
//   deleteLocalFile,
//   getErrorMessage,
//   log,
//   printErrorMessage,
// } from '#/utils';
// import { UploadApiResponse, v2 } from 'cloudinary';

// class CloudinaryService {
//   response: UploadApiResponse | null;

//   constructor(cloud_name: string, api_key: string, api_secret: string) {
//     this.response = null;

//     // configure cloudinary
//     v2.config({ cloud_name, api_key, api_secret });
//   }

//   upload = async (localFilePath: string) => {
//     try {
//       // check if file path is missing
//       if (!localFilePath || localFilePath.length < 1) {
//         printErrorMessage('💀No File Path Found!!', 'cloudinary: upload()');
//         return null;
//       }

//       // check if file exists on the local server
//       const response = await v2.uploader.upload(localFilePath, {
//         resource_type: 'auto',
//         // timeout: 600000,
//       });

//       log.info(`✅   File is uploaded on Cloudinary: ${response.url}`);

//       this.response = response;
//     } catch (error) {
//       printErrorMessage(`💀${getErrorMessage(error)}`, 'cloudinary: upload()');
//     } finally {
//       await deleteLocalFile(localFilePath);

//       return this.response;
//     }
//   };

//   delete = async (fileURL: string) => {
//     try {
//       // check if file URL is missing
//       if (!fileURL || fileURL.length < 1) {
//         printErrorMessage('💀No File URL Found!!', 'cloudinary: delete()');
//         return null;
//       }

//       // delete file from cloudinary
//       const response = await v2.uploader.destroy(fileURL);

//       log.info(`✅   File is deleted from Cloudinary: ${response}`);

//       this.response = response;
//     } catch (error) {
//       printErrorMessage(`💀${getErrorMessage(error)}`, 'cloudinary: delete()');
//     } finally {
//       return this.response;
//     }
//   };
// }

// export const cloudinary = new CloudinaryService(
//   env.CLOUDINARY_CLOUD_NAME,
//   env.CLOUDINARY_API_KEY,
//   env.CLOUDINARY_API_SECRET,
// );
