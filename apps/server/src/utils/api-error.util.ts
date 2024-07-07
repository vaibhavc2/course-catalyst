import { ErrorMessages, StatusCode } from '@/common/error.enums';
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
 * @example throw ApiError.notImplemented();
 */

class ApiErrorService extends Error {
  statusCode: number;
  data: null;
  message: string;
  success: boolean;
  errors: unknown[] | unknown | undefined;

  constructor(
    statusCode: number,
    message: string = ErrorMessages.SOMETHING_WENT_WRONG,
    errors?: unknown[] | unknown,
    stackTrace: string = '',
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

export class ApiError {
  static custom(statusCode: number, message: string, errors?: unknown[]) {
    return new ApiErrorService(statusCode, message, errors);
  }

  static badRequest(message: string, errors?: unknown[]) {
    return new ApiErrorService(StatusCode.BAD_REQUEST, message, errors);
  }

  static requiredFields(
    notIncludedFields: string[],
    message = ErrorMessages.MISSING_FIELDS,
    errors?: unknown[],
  ) {
    return new ApiErrorService(
      StatusCode.BAD_REQUEST,
      isDev
        ? `Missing fields: ${notIncludedFields.join(
            ', ',
          )}. ${message || ErrorMessages.MISSING_FIELDS}`
        : message || ErrorMessages.MISSING_FIELDS,
      errors,
    );
  }

  static unauthorized(message?: string, errors?: unknown[]) {
    return new ApiErrorService(
      StatusCode.UNAUTHORIZED,
      message || ErrorMessages.UNAUTHORIZED,
      errors,
    );
  }

  static forbidden(message?: string, errors?: unknown[]) {
    return new ApiErrorService(
      StatusCode.FORBIDDEN,
      message || ErrorMessages.FORBIDDEN,
      errors,
    );
  }

  static notFound(message?: string, errors?: unknown[]) {
    return new ApiErrorService(
      StatusCode.NOT_FOUND,
      message || ErrorMessages.NOT_FOUND,
      errors,
    );
  }

  static notImplemented(message?: string, errors?: unknown[]) {
    return new ApiErrorService(
      StatusCode.NOT_IMPLEMENTED,
      message || ErrorMessages.NOT_IMPLEMENTED,
      errors,
    );
  }

  static conflict(message?: string, errors?: unknown[]) {
    return new ApiErrorService(StatusCode.CONFLICT, message, errors);
  }

  static internal(message?: string, errors?: unknown[]) {
    return new ApiErrorService(
      StatusCode.INTERNAL_SERVER_ERROR,
      message,
      errors,
    );
  }

  static serviceUnavailable(message?: string, errors?: unknown[]) {
    return new ApiErrorService(
      StatusCode.SERVICE_UNAVAILABLE,
      message || ErrorMessages.SERVICE_UNAVAILABLE,
      errors,
    );
  }
}

export interface ApiErrorInterface extends ApiErrorService {}

export function isApiError(error: any): error is ApiErrorInterface {
  return 'statusCode' in error && 'message' in error;
}
