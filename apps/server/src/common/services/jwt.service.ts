import {
  AccessTokenParams,
  AccessTokenPayloadDTO,
  ActivationTokenParams,
  ActivationTokenPayloadDTO,
  RefreshTokenParams,
  RefreshTokenPayloadDTO,
  VerificationPromise,
} from '#/api/v1/entities/dtos/external/jwt.dto';
import { JWT_TOKENS } from '#/api/v1/entities/enums/jwt.tokens';
import envConfig from '#/common/config/env.config';
import { getErrorMessage } from '#/common/utils/error-extras.util';
import { sign, TokenExpiredError, verify } from 'jsonwebtoken';
import { logger } from '../utils/logger.util';
import { convertTimeStr } from '../utils/time.util';

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
  }): Promise<string> => {
    const { secret, expiresIn, data } = params;

    const currentTimestamp = Math.floor(Date.now() / 1000); // in seconds

    const dataWithTimestamps = {
      ...data,
      iat: currentTimestamp, // issued at: current time in seconds
      exp: currentTimestamp + convertTimeStr(expiresIn), // if included here, then expiresIn must not be given! Only one of them should be used.
    };

    // return signed token
    return sign(dataWithTimestamps, secret);
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
        if (err instanceof TokenExpiredError) {
          logger.error('Token expired: ' + payload);
        } else {
          logger.error('Token verification error: ' + err);
        }
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

const jwtService = new JWTService();
export default jwtService;
