import {
  AccessTokenParams,
  AccessTokenPayloadDTO,
  ActivationTokenParams,
  ActivationTokenPayloadDTO,
  RefreshTokenParams,
  RefreshTokenPayloadDTO,
  VerificationPromise,
} from '#/api/v1/entities/dtos/jwt.dto';
import { JWT_TOKENS } from '#/api/v1/entities/enums/jwt.tokens';
import { envConfig } from '#/common/config/env.config';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-error-handling.util';
import { getErrorMessage } from '#/common/utils/error-message.util';
import { convertTimeStr } from '#/common/utils/convert-time-str.util';
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
    data: Record<string, any>;
  }) => {
    const { secret, expiresIn, data } = params;

    const dataWithTimestamps = {
      ...data,
      iat: Date.now(),
      exp: convertTimeStr(expiresIn, true) + Date.now(),
    };

    const token = sign(dataWithTimestamps, secret, {
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

  generateAccessToken = async ({ userId }: AccessTokenParams) => {
    return await this.generateToken({
      secret: this.accessToken.secret,
      expiresIn: this.accessToken.expiresIn,
      data: {
        userId,
        type: JWT_TOKENS.ACCESS,
      },
    });
  };

  generateRefreshToken = async ({ userId }: RefreshTokenParams) => {
    return await this.generateToken({
      secret: this.refreshToken.secret,
      expiresIn: this.refreshToken.expiresIn,
      data: {
        userId,
        type: JWT_TOKENS.REFRESH,
      },
    });
  };

  generateActivationToken = async ({
    email,
    otpCode,
  }: ActivationTokenParams) => {
    return await this.generateToken({
      secret: this.activationToken.secret,
      expiresIn: this.activationToken.expiresIn,
      data: { email, otpCode, type: JWT_TOKENS.ACTIVATION },
    });
  };

  verifyAccessToken = async (token: string) => {
    return (await this.verifyToken({
      token,
      secret: this.accessToken.secret,
    })) as VerificationPromise<AccessTokenPayloadDTO>;
  };

  verifyActivationToken = async (token: string) => {
    return (await this.verifyToken({
      token,
      secret: this.activationToken.secret,
    })) as VerificationPromise<ActivationTokenPayloadDTO>;
  };

  verifyRefreshToken = async (token: string) => {
    return (await this.verifyToken({
      token,
      secret: this.refreshToken.secret,
    })) as VerificationPromise<RefreshTokenPayloadDTO>;
  };

  disableAccessToken = async (token: string) => {
    return await this.disableToken({
      token,
      secret: this.accessToken.secret,
    });
  };
}

export const jwt = wrapAsyncMethodsOfClass(new JWTService());
