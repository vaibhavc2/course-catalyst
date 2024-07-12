import { ct } from '#/constants';
import { NextFunction, Request, Response } from 'express';

export const supplyAppVersionHeader = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // set the App-Version header
  res.set('App-Version', ct.appVersion);

  next();
};
