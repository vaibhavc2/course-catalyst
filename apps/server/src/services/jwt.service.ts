import { envConfig } from '#/config/env.config';
import { wrapAsyncMethodsOfClass } from '#/utils/async-error-handling.util';
import { getErrorMessage } from '#/utils/error-message.util';
import { sign, verify } from 'jsonwebtoken';

const {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  ACTIVATION_TOKEN_SECRET,
  ACTIVATION_TOKEN_EXPIRY,
} = envConfig;

interface Token {
  secret: string;
  expiresIn: string;
}

type VerificationPromise<T> = Promise<T | null>;

type ActivationTokenData = {
  email: string;
  otpCode: string | number;
};

class JWTService {
  private readonly accessToken: Token;
  private readonly refreshToken: Token;
  private readonly activationToken: Token;

  constructor() {
    this.accessToken = {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    };
    this.refreshToken = {
      secret: REFRESH_TOKEN_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRY,
    };
    this.activationToken = {
      secret: ACTIVATION_TOKEN_SECRET,
      expiresIn: ACTIVATION_TOKEN_EXPIRY,
    };
  }

  private generateToken = async (params: {
    secret: string;
    expiresIn: string;
    data: any;
  }) => {
    const { secret, expiresIn, data } = params;
    const token = sign(data, secret, {
      expiresIn: expiresIn,
    });
    return token;
  };

  private disableToken = async (params: { token: string; secret: string }) => {
    const { token, secret } = params;
    return await this.generateToken({
      secret,
      expiresIn: '1s',
      data: { token },
    });
  };

  private verifyToken = async (params: { token: string; secret: string }) => {
    const { token, secret } = params;
    return new Promise((resolve, reject) =>
      verify(token, secret, this.errorCallback(resolve, reject)),
    );
  };

  private errorCallback =
    (resolve: (value: any) => void, reject: (reason?: any) => void) =>
    (err: unknown, payload: any) => {
      if (err) {
        reject(getErrorMessage(err) || 'Invalid Token or Token Expired!');
      }
      return resolve(payload);
    };

  generateAccessToken = async (userId: string | number) => {
    return await this.generateToken({
      secret: this.accessToken.secret,
      expiresIn: this.accessToken.expiresIn,
      data: { id: userId },
    });
  };

  generateRefreshToken = async (userId: string | number) => {
    return await this.generateToken({
      secret: this.refreshToken.secret,
      expiresIn: this.refreshToken.expiresIn,
      data: { id: userId },
    });
  };

  generateActivationToken = async ({ email, otpCode }: ActivationTokenData) => {
    return await this.generateToken({
      secret: this.activationToken.secret,
      expiresIn: this.activationToken.expiresIn,
      data: { email, otpCode },
    });
  };

  verifyAccessToken = async (token: string) => {
    return (await this.verifyToken({
      token,
      secret: this.accessToken.secret,
    })) as VerificationPromise<{ id: string }>;
  };

  verifyActivationToken = async (token: string) => {
    return (await this.verifyToken({
      token,
      secret: this.activationToken.secret,
    })) as VerificationPromise<ActivationTokenData>;
  };

  verifyRefreshToken = async (token: string) => {
    return (await this.verifyToken({
      token,
      secret: this.refreshToken.secret,
    })) as VerificationPromise<{ id: string }>;
  };

  disableAccessToken = async (token: string) => {
    return await this.disableToken({
      token,
      secret: this.accessToken.secret,
    });
  };
}

export const jwt = wrapAsyncMethodsOfClass(new JWTService());
