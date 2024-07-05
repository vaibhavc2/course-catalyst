import { NextFunction, Request, Response } from 'express';

type AsyncRequestHandler<T> = (
  req: Request,
  res: Response,
  next?: NextFunction,
) => Promise<T>;

export const asyncRequestHandler = <T>(fn: AsyncRequestHandler<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch((error: Error | unknown) =>
      next(error),
    );
  };
};
