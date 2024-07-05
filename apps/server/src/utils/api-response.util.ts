import { Response } from 'express';

class ApiResponseService {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;

  constructor(statusCode: number, message?: string, data?: any) {
    this.statusCode = statusCode;
    this.message = message || 'No message provided';
    this.data = data;
    this.success = statusCode < 400;
  }
}

export class ApiResponse {
  private readonly res: Response;
  constructor(private readonly response: Response) {
    this.res = response;
  }

  public send(statusCode: number, message?: string, data?: any) {
    return this.res
      .status(statusCode)
      .json(new ApiResponseService(statusCode, message, data));
  }

  public success(message?: string, data?: any) {
    return this.send(200, message, data);
  }

  public created(message?: string, data?: any) {
    return this.send(201, message, data);
  }

  public error(
    statusCode: number = 500,
    message: string = 'Internal Server Error!',
    data?: any,
  ) {
    return this.send(statusCode, message, data);
  }

  public badRequest(message?: string, data?: any) {
    return this.send(400, message, data);
  }

  public unauthorized(message?: string, data?: any) {
    return this.send(401, message, data);
  }

  public forbidden(message?: string, data?: any) {
    return this.send(403, message, data);
  }

  public notFound(message?: string, data?: any) {
    return this.send(404, message, data);
  }

  public internalServerError(
    message: string = 'Internal Server Error!',
    data?: any,
  ) {
    return this.send(500, message, data);
  }
}
