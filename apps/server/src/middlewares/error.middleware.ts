import { StatusCode } from '#/common/entities/enums/error.enums';
import { logger } from '#/common/winston.logger';
import { envConfig } from '#/config/env.config';
import { ApiError } from '#/utils/api-error.util';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';

const { isDev } = envConfig;

interface UnknownError extends Error {
  name: string;
  message: string;
  statusCode: number;
  stack?: string;
  code?: number;
}

export class ErrorMiddleware {
  constructor() {}

  private sendErrorResponse(
    statusCode: number,
    message: string,
    res: Response,
  ) {
    return res.status(statusCode).json({
      status: statusCode,
      success: false,
      message,
    });
  }

  public handler = (
    error: UnknownError,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (error instanceof ApiError) {
      const { statusCode, message } = error;
      return this.sendErrorResponse(statusCode, message, res);
    }
    // else if (
    //   error instanceof Error &&
    //   error.name === 'MongoError' &&
    //   error.code === 11000
    // ) {
    //   return this.sendErrorResponse(StatusCode.UNAUTHORIZED, 'Duplicate key error!', res);
    // } else if (error instanceof Error && error.name === 'ValidationError') {
    //   return this.sendErrorResponse(StatusCode.UNAUTHORIZED, error.message, res);
    // } else if (error instanceof Error && error.name === 'CastError') {
    //   return this.sendErrorResponse(StatusCode.UNAUTHORIZED, 'Invalid ID!', res);
    // } else if (error instanceof Error && error.name === 'SyntaxError') {
    //   return this.sendErrorResponse(StatusCode.UNAUTHORIZED, 'Invalid JSON!', res);
    // }
    else if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return this.sendErrorResponse(
        StatusCode.UNAUTHORIZED,
        'Invalid token!',
        res,
      );
    } else if (error instanceof Error && error.name === 'TokenExpiredError') {
      return this.sendErrorResponse(
        StatusCode.UNAUTHORIZED,
        'Token expired!',
        res,
      );
    } else {
      return this.sendErrorResponse(
        error.code || StatusCode.INTERNAL_SERVER_ERROR,
        error.message || 'Something went wrong!',
        res,
      );
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
            chalk.red(`${error.message}\n`),
        );
      }
    } else {
      logger.error(`Error occurred on the route: ${req.path}\n${error}\n`);
    }

    next(error);
  };

  public routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    if (isDev) logger.error(chalk.red(`Route not found: ${req.path}`));

    return this.sendErrorResponse(
      StatusCode.NOT_IMPLEMENTED,
      'Route not found',
      res,
    );
  };
}

export const errorMiddleware = new ErrorMiddleware();
