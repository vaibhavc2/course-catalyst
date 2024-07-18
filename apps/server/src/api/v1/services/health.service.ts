import { HealthDTO } from '#/api/v1/entities/dtos/health.dto';
import { StatusCode } from '#/api/v1/entities/enums/error.enums';
import checkupService from '#/api/v1/services/external/checkup.service';
import ct from '#/common/constants';
import { StandardResponseDTO } from '#/types';

interface results {
  google?: HealthDTO.CheckResult;
  db?: HealthDTO.CheckResult;
  disk?: HealthDTO.CheckResult;
  memory?: HealthDTO.CheckResult;
}

interface HealthServiceDTO {
  index: () => Promise<StandardResponseDTO<{ results: results }>>;
}

class HealthService implements HealthServiceDTO {
  async index() {
    const google = await checkupService.httpCheck(ct.checkup.http.url);
    const db = await checkupService.dbCheck();
    const disk = await checkupService.diskCheck();
    const memory = await checkupService.memoryCheck();

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

const healthService = new HealthService();
export default healthService;
