import { RegisterDTO } from '#/common/dtos/user.dto';
import { ApiError } from '#/utils/api-error.util';
import { ApiResponse } from '#/utils/api-response.util';
import { autoWrapAsyncMethods } from '#/utils/async-error-handling.util';
import { Request, Response } from 'express';
import { userService } from './users.service';

export const userController = autoWrapAsyncMethods({
  register: async (req: Request, res: Response) => {
    const { name, email, password }: RegisterDTO = req.body;

    const { success, status, message, data } =
      (await userService.register({
        name,
        email,
        password,
      })) ?? {};

    if (!success) {
      if (status) throw new ApiError().custom(status, message);
      throw new ApiError().badRequest(message);
    } else {
      return new ApiResponse(res).success(message, data);
    }
  },
});
