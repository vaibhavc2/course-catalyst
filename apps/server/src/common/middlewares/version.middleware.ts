import ct from '#/common/constants';
import { NextFunction, Request, Response } from 'express';
import { wrapAsyncMethodsOfClass } from '../utils/async-errors.util';

class VersionMiddleware {
  async supplyAppVersionHeader(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    // set the App-Version header
    res.set('App-Version', ct.appVersion);

    next();
  }

  // check if the App-Version header is missing or outdated
  // This middleware should be used in all routes that require the App-Version header
  // TODO: ! use in production
  async checkAppVersion(req: Request, res: Response, next: NextFunction) {
    // get the App-Version header
    const appVersion = req.get('App-Version');

    // check if App-Version header is missing
    if (!appVersion) {
      return res.status(400).json({
        message: 'App-Version header is required!',
      });
    }

    // check if App-Version header is outdated
    if (appVersion !== ct.appVersion) {
      return res.status(426).json({
        message: 'App-Version is outdated! Please update the app!',
      });
    }

    next();
  }
}

const versionMiddleware = wrapAsyncMethodsOfClass(new VersionMiddleware());
export default versionMiddleware;
