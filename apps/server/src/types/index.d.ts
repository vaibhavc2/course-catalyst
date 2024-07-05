import { UserData } from '@reg/types';
import { MySql2PreparedQuery } from 'drizzle-orm/mysql2';
import { PreparedQueryConfig } from 'drizzle-orm/sqlite-proxy';
// import { TsRestRequest as OriginalTsRestRequest } from '@ts-rest/express';

declare global {
  namespace Express {
    // type MulterFile = Express.Multer.File;
    // type MulterFiles = { [fieldname: string]: Express.Multer.File[] };
    interface Request {
      user?: UserData;
      token?: string;
      // file?: MulterFile;
      // files?: MulterFiles;
    }
  }
}

// declare module '@ts-rest/express' {
//   export interface TsRestRequest extends OriginalTsRestRequest {
//     user?: User;
//   }
// }

// other types
export type PreparedQueryType<T> =
  | MySql2PreparedQuery<
      PreparedQueryConfig & {
        execute: T | undefined;
        iterator: AsyncGenerator<T>;
      }
    >
  | undefined;

export {};
