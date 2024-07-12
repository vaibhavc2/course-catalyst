import { RegisterDTO } from '#/common/dtos/user.dto';
import { ApiError } from '#/utils/api-error.util';
import { ApiResponse } from '#/utils/api-response.util';
import { autoWrapAsyncHandlers } from '#/utils/async-error-handling.util';
import { Request, Response } from 'express';
import { userService } from './users.service';

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
});
