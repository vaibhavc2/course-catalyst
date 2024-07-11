import { logger } from '@/common/winston.logger';

type ErrorWithMessage = {
  message: string;
};

// If error has other properties in addition to message, it doesn't affect the result of the function. The function is only concerned with whether error has a message property of type string.
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

export function printErrorMessage(error: unknown, context = '') {
  const errorMessage = getErrorMessage(error);
  logger.error(`Error in ${context}: ${errorMessage}`);
}
