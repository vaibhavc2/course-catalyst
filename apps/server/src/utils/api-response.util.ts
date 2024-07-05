import { envConfig } from '@/config/env.config';

const { isDev } = envConfig;

class ApiResponseService {
  constructor() {}

  public res<T extends number, TT extends string>(
    status: T,
    message: TT,
    data?: any,
  ) {
    return {
      status,
      body: {
        status,
        message,
        data,
      },
    };
  }

  public error<T extends number, TT extends string>(
    status: T,
    message: TT,
    error?: any,
  ) {
    return {
      status,
      body: {
        status,
        message,
        ...(isDev ? { error } : null),
      },
    };
  }

  public serverError(message?: string) {
    return this.error(500, message || 'Something went wrong!');
  }
}

export const apiResponse = new ApiResponseService();
