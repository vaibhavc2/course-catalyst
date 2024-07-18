import { UserDTO } from '#/api/v1/entities/dtos/user.dto';
import envConfig from '#/common/config/env.config';
import ApiError from '#/common/utils/api-error.util';
import ApiResponse from '#/common/utils/api-response.util';
import {
  asyncErrorHandler,
  wrapAsyncMethodsOfClass,
} from '#/common/utils/async-errors.util';
import { getCookieOptions } from '#/common/utils/cookie-options.util';
import { RequestCookie } from '#/types';
import { NextFunction, Request, Response } from 'express';
import userService from '../services/user.service';

const { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = envConfig;

class UserController {
  async register(req: Request, res: Response) {
    const { name, email, password }: UserDTO.Register = req.body;

    const { message, data } =
      (await userService.register({
        name,
        email,
        password,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async login(req: Request, res: Response) {
    const { email, password }: UserDTO.Login = req.body;

    const { message, data } =
      (await userService.login({
        email,
        password,
        deviceId: req.deviceId as string,
      })) ?? {};

    // Set cookies
    res.cookie(
      'accessToken',
      data?.tokens.accessToken,
      getCookieOptions(ACCESS_TOKEN_EXPIRY),
    );
    res.cookie(
      'refreshToken',
      data?.tokens.refreshToken,
      getCookieOptions(REFRESH_TOKEN_EXPIRY),
    );
    // Return response
    return new ApiResponse(res).success(message, data);
  }

  async sendVerificationEmail(req: Request, res: Response) {
    const { email } = req.body as UserDTO.SendVerificationEmail;

    const { message, data } =
      (await userService.sendVerificationEmail({
        email,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async verify(req: Request, res: Response) {
    const { email, otpCode } = req.body as UserDTO.Verify;

    const { message, data } =
      (await userService.verify({
        email,
        otpCode,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.cookies as RequestCookie;
    const deviceId = req.deviceId as string;

    const { message, data } =
      (await userService.refresh({
        deviceId,
        refreshToken,
      })) ?? {};

    // Set cookies
    res.cookie(
      'accessToken',
      data?.tokens.accessToken,
      getCookieOptions(ACCESS_TOKEN_EXPIRY),
    );
    res.cookie(
      'refreshToken',
      data?.tokens.refreshToken,
      getCookieOptions(REFRESH_TOKEN_EXPIRY),
    );
    // Return response
    return new ApiResponse(res).success(message, data);
  }

  async getProfile(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized('Unauthenticated! Login first!');

    const { message, data } =
      (await userService.getProfile({
        userId: req.user?.id as string,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getUserInfo(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized('Unauthenticated! Login first!');

    const data = {
      user: req.user,
    };
    const message = 'User info fetched successfully!';

    return new ApiResponse(res).success(message, data);
  }

  async updateUserInfo(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized('Unauthenticated! Login first!');

    const { name, email } = req.body as UserDTO.UpdateUserInfo;

    const { message, data } =
      (await userService.updateUserInfo({
        userId: req.user?.id as string,
        name: name as string,
        email: email as string,
        prevEmail: req.user?.email as string,
        prevName: req.user?.name as string,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async changePassword(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized('Unauthenticated! Login first!');

    const { currentPassword, newPassword } = req.body as UserDTO.ChangePassword;

    const { message, data } =
      (await userService.changePassword({
        userId: req.user?.id as string,
        currentPassword,
        newPassword,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async logout(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized('Unauthenticated! Login first!');

    const { message, data } = await userService.logout({
      userId: req.user?.id as string,
      deviceId: req.deviceId as string,
    });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return new ApiResponse(res).success(message, data);
  }

  async logoutAllDevices(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized('Unauthenticated! Login first!');

    const { message, data } = await userService.logoutAllDevices({
      userId: req.user?.id as string,
    });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return new ApiResponse(res).success(message, data);
  }
}

const userController = wrapAsyncMethodsOfClass(new UserController());
export default userController;
