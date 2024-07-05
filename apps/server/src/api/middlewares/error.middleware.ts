import { logger } from '@/common/winston.logger';
import { envConfig } from '@/config/env.config';
import { ct } from '@/constants';
import { ApiError } from '@/utils/api-error.util';
import { NextFunction, Request, Response } from 'express';

const { isDev } = envConfig;

export class ErrorMiddleware {
  constructor() {}

  public handler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: 'Something went wrong!',
      });
    }
  };

  public logger = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (error instanceof ApiError) {
      if (isDev) {
        logger.error(
          `Error occurred on the route: ${req.path}\nError: ` +
            ct.chalk.error(`${error.message}\n`),
        );
      }
    } else {
      logger.error(`Error occurred on the route: ${req.path}\n${error}\n`);
    }

    next(error);
  };

  public routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    if (isDev) logger.error(ct.chalk.error(`Route not found: ${req.path}`));

    return res.status(404).json({
      status: 404,
      message: 'Route not found',
    });
  };
}

export const errorMiddleware = new ErrorMiddleware();
