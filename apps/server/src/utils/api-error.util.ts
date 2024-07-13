import { ErrorMessage, StatusCode } from '#/common/entities/enums/error.enums';
import { envConfig } from '#/config/env.config';

const { isDev } = envConfig;

/**
 * Custom error class for API errors.
 * @class ApiError
 * @extends {Error}
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {unknown[]} errors - Array of errors
 * @param {string} stackTrace - Stack trace
 * @returns {void}
 * @example throw ApiError.custom(404, 'Resource not found');
 * @example throw ApiError.notImplemented();
 */
export class ApiError extends Error {
  name: string;
  statusCode: number;
  data: null;
  message: string;
  success: boolean;
  errors: unknown[] | unknown | undefined;

  constructor(
    statusCode: number = StatusCode.INTERNAL_SERVER_ERROR,
    message: string = ErrorMessage.SOMETHING_WENT_WRONG,
    name = 'ApiError',
    errors?: unknown[] | unknown,
    stackTrace: string = '',
  ) {
    super(message); // calls parent class constructor

    this.statusCode = statusCode || 500;
    this.data = null;
    this.message = message;
    this.name = name;
    this.success = false;
    this.errors = errors;

    if (stackTrace) {
      this.stack = stackTrace;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static custom(
    statusCode: number,
    message: string,
    name?: string,
    errors?: unknown[],
  ) {
    return new ApiError(statusCode, message, name, errors);
  }

  static badRequest(message: string, errors?: unknown[]) {
    return new ApiError(
      StatusCode.BAD_REQUEST,
      message,
      'BadRequestError',
      errors,
    );
  }

  static requiredFields(
    notIncludedFields: string[],
    message = ErrorMessage.MISSING_FIELDS,
    errors?: unknown[],
  ) {
    return new ApiError(
      StatusCode.BAD_REQUEST,
      isDev
        ? `Missing fields: ${notIncludedFields.join(
            ', ',
          )}. ${message || ErrorMessage.MISSING_FIELDS}`
        : message || ErrorMessage.MISSING_FIELDS,
      'BadRequestError',
      errors,
    );
  }

  static unauthorized(message?: string, errors?: unknown[]) {
    return new ApiError(
      StatusCode.UNAUTHORIZED,
      message || ErrorMessage.UNAUTHORIZED,
      'UnauthorizedError',
      errors,
    );
  }

  static forbidden(message?: string, errors?: unknown[]) {
    return new ApiError(
      StatusCode.FORBIDDEN,
      message || ErrorMessage.FORBIDDEN,
      'ForbiddenError',
      errors,
    );
  }

  static notFound(message?: string, errors?: unknown[]) {
    return new ApiError(
      StatusCode.NOT_FOUND,
      message || ErrorMessage.NOT_FOUND,
      'NotFoundError',
      errors,
    );
  }

  static notImplemented(message?: string, errors?: unknown[]) {
    return new ApiError(
      StatusCode.NOT_IMPLEMENTED,
      message || ErrorMessage.NOT_IMPLEMENTED,
      'NotImplementedError',
      errors,
    );
  }

  static conflict(message?: string, errors?: unknown[]) {
    return new ApiError(StatusCode.CONFLICT, message, 'ConflictError', errors);
  }

  static internal(message?: string, errors?: unknown[]) {
    return new ApiError(
      StatusCode.INTERNAL_SERVER_ERROR,
      message,
      'InternalServerError',
      errors,
    );
  }

  static serviceUnavailable(message?: string, errors?: unknown[]) {
    return new ApiError(
      StatusCode.SERVICE_UNAVAILABLE,
      message || ErrorMessage.SERVICE_UNAVAILABLE,
      'ServiceUnavailableError',
      errors,
    );
  }
}
