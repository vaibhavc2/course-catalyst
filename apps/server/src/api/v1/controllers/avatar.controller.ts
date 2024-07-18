import ApiError from '#/common/utils/api-error.util';
import ApiResponse from '#/common/utils/api-response.util';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-errors.util';
import { Request, Response } from 'express';
import avatarService from '../services/avatar.service';

class AvatarController {
  async upload(req: Request, res: Response) {
    const { avatar, user } = req;

    if (!avatar) throw ApiError.badRequest('Image is required!');
    if (!user) throw ApiError.unauthorized('Unauthenticated! Login first!');

    const { message, data } =
      (await avatarService.upload({ avatar, userId: user?.id })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getInfo(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized('Unauthenticated! Login first!');

    const { message, data } =
      (await avatarService.getInfo({ userId: req.user?.id })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async delete(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized('Unauthenticated! Login first!');

    const { message, data } =
      (await avatarService.delete({ userId: req.user?.id })) ?? {};

    return new ApiResponse(res).success(message, data);
  }
}

const avatarController = wrapAsyncMethodsOfClass(new AvatarController());
export default avatarController;
