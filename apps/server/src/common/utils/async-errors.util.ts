import { logger } from '#/common/utils/logger.util';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';
import ApiError from './api-error.util';
import { errorEmitter, getErrorMessage } from './error-extras.util';

/**
 * A type definition for an async error handler function that takes a Request and Response
 * object and returns a Promise of type T.
 *
 * @param req The Request object
 * @param res The Response object
 * @param next The NextFunction object
 * @returns A Promise of type T
 *
 * handles async errors in express handlers
 */

type ExpressHandler<T> = (
  req: Request,
  res: Response,
  next?: NextFunction,
) => Promise<T>;

type ExpressHandlerWithNext<T> = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<T>;

type ExpressAsyncMethod<T> = ExpressHandler<T> | ExpressHandlerWithNext<T>;

export const asyncErrorHandler = <T>(fn: ExpressAsyncMethod<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch((error: Error | unknown) =>
      next(error),
    );
  };
};

// ******************************************************************************************************************** //

// Controller method type
type ControllerMethod = (
  req: Request,
  res: Response,
  next?: NextFunction,
) => Promise<any>;

// Controller type
type Controller = {
  [key: string]: ControllerMethod;
};

/**
 * Automatically wraps all async methods in a controller with the asyncErrorHandler
 * utility function to handle errors in async functions.
 * @param controller The controller object to wrap
 * @returns The wrapped controller object
 * @example
 * const healthController = autoWrapAsyncHandlers({
 *  index: async (req: Request, res: Response) => {
 *   throw ApiError.notImplemented();
 * },
 */

// Auto-wrap utility function to handle errors in async functions (req, res, next)
export function autoWrapAsyncHandlers<T extends Controller>(controller: T): T {
  const tempWrappedController: Record<string, any> = {};
  Object.keys(controller).forEach((key) => {
    const originalMethod: ControllerMethod = controller[key];
    if (typeof originalMethod === 'function') {
      tempWrappedController[key] =
        asyncErrorHandler<ControllerMethod>(originalMethod);
    } else {
      tempWrappedController[key] = originalMethod;
    }
  });
  return tempWrappedController as T;
}

// ******************************************************************************************************************** //

// Define a generic function type that can take any arguments and return a Promise
type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;

/**
 * Wraps an async function in a try/catch block to catch any errors that occur
 * and log them to the console.
 *
 * @param fn The async function to wrap
 * @returns A new async function that will log any errors that occur
 */

export function asyncFnWrapper<T extends any[], R>(
  fn: AsyncFunction<T, R>,
): (...args: T) => Promise<R | undefined> {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        errorEmitter.emit('error', error);
      } else {
        const errorMessage = getErrorMessage(error);
        logger.error('An error occurred: ' + chalk.red(`${errorMessage}`));

        // emit an error event
        errorEmitter.emit(
          'error',
          ApiError.internal(errorMessage || 'Something went wrong!'),
        );
      }
    }
  };
}

/**
 * Wraps all async methods of a class instance with the asyncErrorHandler utility
 * function to handle errors in async functions. Use only with classes that have async methods with (req, res, next) parameters. (safe for middlewares and controllers)
 * @param targetClassInstance The class instance to wrap
 * @returns The wrapped class instance
 */
export function wrapAsyncMethodsOfClass<T extends object>(
  targetClassInstance: T,
): T {
  const handler: ProxyHandler<T> = {
    get(target: T, propKey: PropertyKey, receiver: any): any {
      const originalMethod: unknown = Reflect.get(target, propKey, receiver);
      if (
        typeof originalMethod === 'function' &&
        originalMethod.constructor.name === 'AsyncFunction'
      ) {
        // Explicitly handle Request, Response, and NextFunction arguments
        const wrappedMethod: ExpressHandlerWithNext<T | void> = async (
          req: Request,
          res: Response,
          next: NextFunction,
        ) => {
          try {
            // Ensure 'originalMethod' is called with correct 'this' context and arguments
            await (originalMethod as ExpressHandlerWithNext<T>).call(
              target,
              req,
              res,
              next,
            );
          } catch (error) {
            // Correctly call 'next' with the caught error
            next(error);
          }
        };
        return wrappedMethod;
      }
      return originalMethod;
    },
  };
  // Correctly use 'new Proxy(...)' to create the proxy object
  return new Proxy(targetClassInstance, handler);
}
