import { Response } from 'express';

class ApiResponseService {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;

  constructor(statusCode: number, message?: string, data?: any) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message || 'No message provided';
    this.data = data;
  }
}

export class ApiResponse {
  private readonly res: Response;
  constructor(response: Response) {
    this.res = response;
  }

  send(statusCode: number, message?: string, data?: any) {
    return this.res
      .status(statusCode)
      .json(new ApiResponseService(statusCode, message, data));
  }

  success(message?: string, data?: any) {
    return this.send(200, message, data);
  }

  created(message?: string, data?: any) {
    return this.send(201, message, data);
  }

  error(
    statusCode: number = 500,
    message: string = 'Internal Server Error!',
    data?: any,
  ) {
    return this.send(statusCode, message, data);
  }

  badRequest(message?: string, data?: any) {
    return this.send(400, message, data);
  }

  unauthorized(message?: string, data?: any) {
    return this.send(401, message, data);
  }

  forbidden(message?: string, data?: any) {
    return this.send(403, message, data);
  }

  notFound(message?: string, data?: any) {
    return this.send(404, message, data);
  }

  internalServerError(message: string = 'Internal Server Error!', data?: any) {
    return this.send(500, message, data);
  }
}
