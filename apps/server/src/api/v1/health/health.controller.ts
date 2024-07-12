import { ApiResponse } from '#/utils/api-response.util';
import { autoWrapAsyncHandlers } from '#/utils/async-error-handling.util';
import { Request, Response } from 'express';
import { healthService } from './health.service';

export const healthController = autoWrapAsyncHandlers({
  index: async (req: Request, res: Response) => {
    const results = (await healthService.index()) ?? {};

    const { status, message, data } = results;

    return new ApiResponse(res).send(status || 200, message, data);
  },
});
