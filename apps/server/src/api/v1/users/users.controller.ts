import {
  RegisterDTO,
  LoginDTO,
  VerifyDTO,
} from '#/common/entities/dtos/users.dto';
import { ApiError } from '#/utils/api-error.util';
import { ApiResponse } from '#/utils/api-response.util';
import { autoWrapAsyncHandlers } from '#/utils/async-error-handling.util';
import { Request, Response } from 'express';
import { userService } from './users.service';
import { getCookieOptions } from '#/utils/cookie-options.util';
import { envConfig } from '#/config/env.config';

const { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = envConfig;

export const userController = autoWrapAsyncHandlers({
  register: async (req: Request, res: Response) => {
    const { name, email, password }: RegisterDTO = req.body;

    const { message, data } =
      (await userService.register({
        name,
        email,
        password,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  },

  login: async (req: Request, res: Response) => {
    const { email, password }: LoginDTO = req.body;

    const { message, data } =
      (await userService.login({
        email,
        password,
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
  },

  sendVerificationEmail: async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };

    const { message, data } =
      (await userService.sendVerificationEmail({
        email,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  },

  verify: async (req: Request, res: Response) => {
    const { email, otpCode } = req.body as VerifyDTO;

    const { message, data } =
      (await userService.verify({
        email,
        otpCode,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  },

  logout: async (req: Request, res: Response) => {
    const { message, data } = await userService.logout(String(req.user?.id));

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return new ApiResponse(res).success(message, data);
  },
});
