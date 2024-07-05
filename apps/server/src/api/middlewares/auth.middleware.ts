// import { queries } from '@/queries';
// import { apiResponse, jwt } from '@/services';
// import { asyncHandler } from '@/utils';
// import { NextFunction, Request, Response } from 'express';

// export class Authentication {
//   constructor() {}

//   public user = (
//     { verified, skipNext }: { verified?: boolean; skipNext?: boolean } = {
//       verified: false,
//       skipNext: false,
//     },
//   ) =>
//     asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//       // this checks if user is authenticated
//       // check if token exists
//       const token: string | undefined =
//         req.cookies?.accessToken ||
//         req.header('Authorization')?.replace('Bearer ', '');

//       if (!token) {
//         return res
//           .status(401)
//           .json(apiResponse.error(401, 'Unauthorized!').body);
//       }

//       // if yes, verify token
//       const { id } = jwt.verifyAccessToken(token) ?? {};

//       if (!id) {
//         return res
//           .status(401)
//           .json(
//             apiResponse.error(401, 'Invalid Access Token! Unauthorized!').body,
//           );
//       }

//       // find user in db using the decoded token
//       const user = await queries.users.getDetails(id);

//       if (!user) {
//         return res
//           .status(401)
//           .json(
//             apiResponse.error(401, 'Invalid Access Token! Unauthorized!').body,
//           );
//       }

//       // check if user is verified
//       if (verified && user.status !== 'active') {
//         return res
//           .status(401)
//           .json(apiResponse.error(401, 'Unverified! Verify first!').body);
//       }

//       // if user found, attach user to req object
//       req.user = user;
//       req.token = token;

//       if (skipNext) return;
//       next();
//     });

//   public admin = asyncHandler(
//     async (req: Request, res: Response, next: NextFunction) => {
//       // authenticate user
//       // TODO: unverified users can't be admins: implement this in handler function in future
//       await this.user({ verified: true, skipNext: true })(req, res, next);

//       // check if user is admin
//       if (req.user?.role !== 'admin') {
//         return res.status(403).json(apiResponse.error(403, 'Forbidden!').body);
//       }

//       next();
//     },
//   );

//   public moderator = asyncHandler(
//     async (req: Request, res: Response, next: NextFunction) => {
//       // authenticate user
//       // TODO: unverified users can't be moderators: implement this in handler function in future
//       await this.user({ verified: true, skipNext: true })(req, res, next);

//       // check if user is moderator or admin
//       if (req.user?.role !== 'moderator' && req.user?.role !== 'admin') {
//         return res.status(403).json(apiResponse.error(403, 'Forbidden!').body);
//       }

//       next();
//     },
//   );
// }
