import { envConfig } from '@/config/env.config';

const { isDev } = envConfig;

/**
 * Custom error class for API errors
 * @class ApiError
 * @extends {Error}
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {unknown[]} errors - Array of errors
 * @param {string} stackTrace - Stack trace
 * @returns {void}
 * @example throw new ApiError(404, 'User not found');
 */

class ApiError extends Error {
  statusCode: number;
  data: null;
  message: string;
  success: boolean;
  errors: unknown[] | unknown | undefined;

  constructor(
    statusCode: number,
    message = 'Something went wrong!',
    errors?: unknown[] | unknown,
    stackTrace = '',
  ) {
    super(message); // calls parent class constructor

    this.statusCode = statusCode || 500;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stackTrace) {
      this.stack = stackTrace;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class RequiredBodyError extends ApiError {
  constructor(notIncludedFields: string[]) {
    super(400);

    if (isDev)
      this.message = `Missing fields: ${notIncludedFields.join(
        ', ',
      )}. Please fill in all the required fields.`;
    else this.message = 'Please fill in all the required fields!';
  }
}

class UnauthorizedError extends ApiError {
  constructor() {
    super(401, 'Unauthorized request!');
  }
}

export { ApiError, RequiredBodyError, UnauthorizedError };
