import { ApiResponse } from '#/common/utils/api-response.util';
import { autoWrapAsyncHandlers } from '#/common/utils/async-error-handling.util';
import { Request, Response } from 'express';
import { healthService } from '../services/health.service';

export const healthController = autoWrapAsyncHandlers({
  index: async (req: Request, res: Response) => {
    const results = (await healthService.index()) ?? {};

    const { status, message, data } = results;

    return new ApiResponse(res).send(status || 200, message, data);
  },
});
