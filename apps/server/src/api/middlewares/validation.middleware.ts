// import {
//   ApiError,
//   RequiredBodyError,
//   asyncHandler,
//   getErrorMessage,
//   log,
// } from '@/utils';
// import { NextFunction, Request, Response } from 'express';
// import { AnyZodObject, ZodError } from 'zod';

// export class ValidationMiddleware {
//   constructor() {}

//   public fields = (fields: string[]) =>
//     asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//       const missingFields = [];
//       const keys = Object.keys(req.body); // Included fields

//       // Checks if every required field is in the body
//       for (const field of fields)
//         if (!keys.includes(field)) missingFields.push(field);

//       // If there are missing fields then run next error middleware
//       if (missingFields.length)
//         return next(new RequiredBodyError(missingFields));

//       // If no missing fields then run router code
//       return next();
//     });

//   public zod = (schema: AnyZodObject) =>
//     asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//       log.info(JSON.stringify(req.body, null, 2));
//       try {
//         await schema.parseAsync({
//           body: req.body,
//           query: req.query,
//           params: req.params,
//           headers: req.headers,
//         });

//         return next();
//       } catch (error: unknown) {
//         if (error instanceof ZodError) {
//           next(
//             new ApiError(
//               400,
//               `${error.issues.map((issue) => issue.message).join(' ')}`,
//             ),
//           );
//         } else {
//           next(new ApiError(400, `${getErrorMessage(error)}`));
//         }
//       }
//     });
// }
