import { NextFunction, Request, Response } from 'express';
import pwdService from '../services/password.service';
import ApiError from '../utils/api-error.util';
import { logger } from '../utils/logger.util';
import { asyncErrorHandler } from '../utils/async-errors.util';

class PasswordMiddleware {
  public hash = asyncErrorHandler(async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { password } = req.body;

    if (password) {
      try {
        // hash the password
        req.body.password = await pwdService.hash(password);

        next();
      } catch (err) {
        logger.error('Error hashing password: ' + err);
        throw ApiError.internal('Something went wrong!');
      }
    } else {
      next();
    }
  });
}

const passwordMiddleware = new PasswordMiddleware();
export default passwordMiddleware;
