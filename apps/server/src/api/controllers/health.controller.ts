import { checkups } from '@/functions/checkup.functions';
import { CheckResult } from '@/types/dtos/health.dto';
import { StatusCode } from '@/types/enums';
import { ApiError } from '@/utils/api-error.util';
import { ApiResponse } from '@/utils/api-response.util';
import { autoWrapAsyncMethods } from '@/utils/async-error-handling.util';
import { Request, Response } from 'express';

interface results {
  google?: CheckResult;
  db?: CheckResult;
  disk?: CheckResult;
  memory?: CheckResult;
}

export const healthController = autoWrapAsyncMethods({
  index: async (req: Request, res: Response) => {
    //? use Promise.all to run all checks concurrently, if needed
    // const results = await Promise.all([
    //   checkups.httpCheck('http://google.com'),
    //   checkups.dbCheck(),
    //   checkups.diskCheck(),
    //   checkups.memoryCheck(),
    // ]);

    const google = await checkups.httpCheck('http://google.com');

    const db = await checkups.dbCheck();

    const disk = await checkups.diskCheck();

    const memory = await checkups.memoryCheck();

    const results: results = {
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
