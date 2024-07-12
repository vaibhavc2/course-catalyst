import { envConfig } from '#/config/env.config';
import { NextFunction, Request, Response } from 'express';

const { APP_VERSION } = envConfig;

export const supplyAppVersionHeader = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // set the App-Version header
  res.set('App-Version', APP_VERSION);

  next();
};
