import { CheckResult } from '#/common/dtos/health.dto';
import { checkup } from '#/services/checkup.service';
import { wrapAsyncMethodsOfClass } from '#/utils/async-error-handling.util';

interface results {
  google?: CheckResult;
  db?: CheckResult;
  disk?: CheckResult;
  memory?: CheckResult;
}

class HealthService {
  async index() {
    const google = await checkup.httpCheck('http://google.com');

    const db = await checkup.dbCheck();

    const disk = await checkup.diskCheck();

    const memory = await checkup.memoryCheck();

    const results: results = {
      google,
      db,
      disk,
      memory,
    };

    return results;
  }
}

export const healthService = wrapAsyncMethodsOfClass(new HealthService());
