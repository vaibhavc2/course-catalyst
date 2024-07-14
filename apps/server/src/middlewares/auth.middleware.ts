import { JWTTOKENS } from '#/common/entities/enums/jwt.tokens';
import prisma from '#/common/prisma.client';
import { jwt } from '#/services/jwt.service';
import { RedisService, redisService } from '#/services/redis.service';
import { ApiError } from '#/utils/api-error.util';
import { asyncErrorHandler } from '#/utils/async-error-handling.util';
import { NextFunction, Request, Response } from 'express';

type VerifySkipNext = { verified?: boolean; skipNext?: boolean } | undefined;

/**
 *  Authentication: It is the process of verifying the identity of a user. It is used to ensure that the user is who they claim to be. It is the mechanism of associating an incoming request with a set of identifying credentials. The credentials are typically provided by the user in the form of a username and password, and the system makes sure that the credentials are valid.
 *  Authorization: It is the process of determining whether a user has permission to perform a specific action. It is the process of granting or denying access to a user based on their identity and the resources they are trying to access. It is the mechanism of associating a set of permissions with a user or role.
 * */

/**
 * Auth Middleware
 *
 * @export
 * @class Auth
 * @description Middleware for user authentication and authorization
 */
class Auth {
  private __user = (
    { verified, skipNext }: VerifySkipNext = {
      verified: false,
      skipNext: false,
    },
  ) =>
    asyncErrorHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        // this checks if user is authenticated
        // check if token exists
        const token: string | undefined =
          req.cookies?.accessToken ||
          req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
          throw ApiError.unauthorized('No Access Token! Unauthorized!');
        }

        // if yes, verify token
        const { userId, type, iat } =
          (await jwt.verifyAccessToken(token)) ?? {};

        if (!userId || type !== JWTTOKENS.ACCESS) {
          throw ApiError.unauthorized('Invalid Access Token! Unauthorized!');
        }

        // check if token is invalidated (logged out all devices)
        const invalidationTimestamp = await redisService.get(
          RedisService.createKey('INVALIDATED', userId),
        );

        if (
          invalidationTimestamp &&
          Number(iat) < Number(invalidationTimestamp)
        ) {
          throw ApiError.unauthorized(
            'Access Token Invalidated! Unauthorized!',
          );
        }

        // find user in db using the decoded token
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
          throw ApiError.unauthorized('User not found! Unauthorized!');
        }

        // check if user is verified
        if (verified && !user.isVerified) {
          throw ApiError.unauthorized('Please verify your email first!');
        }

        // if user found, attach user to req object
        req.user = user;
        req.token = token;

        if (skipNext) return;
        next();
      },
    );

  private __admin = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // authenticate user
      await this.__user({ verified: true, skipNext: true })(req, res, next);

      // check if user is admin (authorize)
      if (req.user?.role !== 'admin') {
        throw ApiError.forbidden('Forbidden! Unauthorized!');
      }

      next();
    },
  );

  // private __moderator = asyncErrorHandler(
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     // authenticate user
  //     await this.__user({ verified: true, skipNext: true })(req, res, next);

  //     // check if user is moderator or admin
  //     if (req.user?.role !== 'moderator' && req.user?.role !== 'admin') {
  //       throw ApiError.forbidden('Forbidden! Unauthorized!');
  //     }

  //     next();
  //   },
  // );

  user() {
    return this.__user();
  }

  verifiedUser() {
    return this.__user({ verified: true });
  }

  admin() {
    return this.__admin;
  }
}

export const auth = new Auth();
