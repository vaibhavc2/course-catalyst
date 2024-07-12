import { StatusCode } from '#/common/error.enums';
import { ApiError } from '#/utils/api-error.util';
import { ApiResponse } from '#/utils/api-response.util';
import { autoWrapAsyncMethods } from '#/utils/async-error-handling.util';
import { Request, Response } from 'express';
import { healthService } from './health.service';

export const healthController = autoWrapAsyncMethods({
  index: async (req: Request, res: Response) => {
    const { google, db, disk, memory } = (await healthService.index()) ?? {};
    const results = {
      google,
      db,
      disk,
      memory,
    };

    if (
      !google?.success &&
      !db?.success &&
      !disk?.success &&
      !memory?.success
    ) {
      throw ApiError.serviceUnavailable(
        'All checks failed!! Immediate action required!',
      );
    } else if (
      google?.success &&
      db?.success &&
      disk?.success &&
      memory?.success
    ) {
      return new ApiResponse(res).success(
        'Server is up and running! All checks passed!',
        { results },
      );
    } else {
      return new ApiResponse(res).error(
        StatusCode.SERVICE_UNAVAILABLE,
        'Some checks failed!!',
        { results },
      );
    }
  },
});
