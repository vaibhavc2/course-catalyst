import { HealthServiceDTO } from '#/api/v1/entities/dtos/health.dto';
import { StatusCode } from '#/api/v1/entities/enums/error.enums';
import { checkup } from '#/api/v1/services/external/checkup.service';
import { ct } from '#/common/constants';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-error-handling.util';

class HealthService {
  async index() {
    const google = await checkup.httpCheck(ct.checkup.http.url);
    const db = await checkup.dbCheck();
    const disk = await checkup.diskCheck();
    const memory = await checkup.memoryCheck();

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
      return {
        status: StatusCode.SERVICE_UNAVAILABLE,
        message: 'All checks failed! Immediate action required!',
        data: { results },
      };
    } else if (
      google?.success &&
      db?.success &&
      disk?.success &&
      memory?.success
    ) {
      return {
        message: 'Server is up and running! All checks passed!',
        data: { results },
      };
    } else if (google?.warn || db?.warn || disk?.warn || memory?.warn) {
      return {
        status: StatusCode.OK,
        message: 'All checks passed, but there are some Warnings!',
        data: { results },
      };
    } else {
      return {
        status: StatusCode.SERVICE_UNAVAILABLE,
        message: 'Some checks failed! Take Action immediately!',
        data: { results },
      };
    }
  }
}

export const healthService: HealthServiceDTO = wrapAsyncMethodsOfClass(
  new HealthService(),
);
