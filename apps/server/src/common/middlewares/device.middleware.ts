import ApiError from '#/common/utils/api-error.util';
import { asyncErrorHandler } from '#/common/utils/async-errors.util';
import { NextFunction, Request, Response } from 'express';

class DeviceMiddleware {
  getDeviceId = asyncErrorHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const deviceId =
      req.cookies?.deviceId ||
      req.header('Device-Id') ||
      req.body.deviceId ||
      req.query.deviceId;

    if (!deviceId) {
      throw ApiError.badRequest('Device ID is required!');
    }

    req.deviceId = deviceId;

    next();
  });
}

const deviceMiddleware = new DeviceMiddleware();
export default deviceMiddleware;
