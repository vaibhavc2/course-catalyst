import ApiResponse from '#/common/utils/api-response.util';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-errors.util';
import { Request, Response } from 'express';
import healthService from '../services/health.service';

class HealthController {
  async index(req: Request, res: Response) {
    const results = (await healthService.index()) ?? {};

    const { status, message, data } = results;

    return new ApiResponse(res).send(status || 200, message, data);
  }
}

const healthController = wrapAsyncMethodsOfClass(new HealthController());
export default healthController;
