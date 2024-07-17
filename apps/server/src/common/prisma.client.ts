import envConfig from '#/common/config/env.config';
import pwdService from '#/common/services/password.service';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger.util';

const { isDev } = envConfig;

// Prisma client with custom extensions: middlewares are deprecated
const prisma = new PrismaClient(
  // Log all queries, errors, info and warning messages in development
  isDev
    ? {
        log: [
          // {
          //   emit: 'stdout',
          //   level: 'query',
          // },
          // {
          //   emit: 'stdout',
          //   level: 'info',
          // },
          {
            emit: 'stdout',
            level: 'error',
          },
          {
            emit: 'stdout',
            level: 'warn',
          },
        ],
      }
    : {
        // Log only errors in production
        log: [
          {
            emit: 'stdout',
            level: 'error',
          },
        ],
      },
).$extends({
  query: {
    user: {
      // hash the password before saving or updating using argon2
      async $allOperations({ operation, model, args, query }) {
        // Skip if the model is not User
        if (model !== 'User') return query(args);

        // Handle different operations that include user data differently
        if (operation === 'create' && args.data) {
          // For create operations, args.data exists
          if (args.data.password) {
            args.data.password = await pwdService.hash(
              String(args.data.password),
            );
          }
        } else if (operation === 'update' && args.data) {
          // For update operations, args.data exists
          if (args.data.password) {
            args.data.password = await pwdService.hash(
              String(args.data.password),
            );
          }
        } else if (operation === 'upsert' && args.create && args.update) {
          // For upsert operations, args.create and args.update exist
          if (args.create.password) {
            args.create.password = await pwdService.hash(
              String(args.create.password),
            );
          }
          if (args.update.password) {
            args.update.password = await pwdService.hash(
              String(args.update.password),
            );
          }
        } else if (operation === 'createMany' && args.data) {
          // For createMany operations, args.data exists
          if (Array.isArray(args.data)) {
            args.data.forEach(async (user) => {
              if (user.password) {
                user.password = await pwdService.hash(String(user.password));
              }
            }); // hash the password for each user
          }
        } else if (operation === 'updateMany' && args.data) {
          // For updateMany operations, args.data exists
          if (args.data.password) {
            args.data.password = await pwdService.hash(
              String(args.data.password),
            );
          }
        }

        // Proceed with the query
        return query(args);
      },
    },
    // logs all queries
    // async $allOperations({ operation, model, args, query }) {
    //   if (isDev) {
    //     try {
    //       const start = performance.now();
    //       const result = await query(args);
    //       const end = performance.now();
    //       const time = end - start;

    //       // Query ${operation} on model ${model} took ${end - start} ms`);
    //       logger.info(
    //         'Prisma Query :: ' +
    //           chalk.yellow(`${model}.${operation}`) +
    //           ' :: ' +
    //           chalk.green(`${time}ms`) +
    //           '\n',
    //         // for debugging: more detailed info about query
    //         // +
    //         // util.inspect(
    //         //   { model, operation, args, time },
    //         //   { showHidden: false, depth: null, colors: true },
    //         // ),
    //       );

    //       return result;
    //     } catch (error) {
    //       logger.error(
    //         'Database error: ' + isDev ? chalk.red(error) : error,
    //       );

    //       throw new Error(getErrorMessage(error)); // Re-throw the error for further handling
    //     }
    //   }
    // },
  },
});

// Log database connection info
async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`; // Lightweight query to test the connection
    logger.info('Connected to Prisma Database!\n');
  } catch (error) {
    logger.error('Failed to establish database connection: ', error);

    // Close the connection
    await prisma.$disconnect();

    // Exit the process
    process.exit(1);
  }
}

testDatabaseConnection();

export default prisma;
