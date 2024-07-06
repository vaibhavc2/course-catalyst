export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  SERVICE_UNAVAILABLE = 503,
}

export enum ErrorMessages {
  MISSING_FIELDS = 'Please fill in all the required fields!',
  UNAUTHORIZED = 'Unauthorized!',
  FORBIDDEN = 'Forbidden!',
  NOT_FOUND = 'Not Found!',
  NOT_IMPLEMENTED = 'Not Implemented!',
  INTERNAL_SERVER_ERROR = 'Internal Server Error!',
  INVALID_TOKEN = 'Invalid token!',
  TOKEN_EXPIRED = 'Token expired!',
  DUPLICATE_KEY = 'Duplicate key error!',
  VALIDATION_ERROR = 'Validation error!',
  INVALID_ID = 'Invalid ID!',
  INVALID_JSON = 'Invalid JSON!',
  SOMETHING_WENT_WRONG = 'Something went wrong!',
  SERVICE_UNAVAILABLE = 'Service unavailable!',
}
