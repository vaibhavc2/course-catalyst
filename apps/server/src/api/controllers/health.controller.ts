import { ApiError } from '@/utils/api-error.util';
import { asyncRequestHandler } from '@/utils/async-request-handler.util';
import { Request, Response } from 'express';

export const healthController = {
  index: asyncRequestHandler(
    async (req: Request, res: Response) => {
      throw new ApiError(500, 'Not implemented yet!');
    },
    // new ApiResponse(res).success('Server is up and running!'),
  ),
};
