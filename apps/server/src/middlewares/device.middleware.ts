import { ApiError } from '#/utils/api-error.util';
import { asyncErrorHandler } from '#/utils/async-error-handling.util';
import { NextFunction, Request, Response } from 'express';

export const deviceIdMiddleware = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);
