import { envConfig } from '@/config/env.config';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const { isProd } = envConfig;

export const logger = createLogger({
  transports: [
    ...(isProd
      ? [
          // file on daily rotation (error only)
          new transports.DailyRotateFile({
            // %DATE will be replaced by the current date
            filename: `logs/%DATE%-error.log`,
            level: 'error',
            format: format.combine(format.timestamp(), format.json()),
            datePattern: 'DD-MM-YYYY',
            zippedArchive: true, // zip the logs to save space
            maxFiles: '30d', // will keep log until they are older than 30 days
          }),
          // file on daily rotation (warn only)
          new transports.DailyRotateFile({
            filename: `logs/%DATE%-warn.log`,
            level: 'warn',
            format: format.combine(format.timestamp(), format.json()),
            datePattern: 'DD-MM-YYYY',
            zippedArchive: true,
            maxFiles: '30d',
          }),
          // new transports.DailyRotateFile({
          //   filename: `logs/%DATE%-combined.log`,
          //   format: format.combine(
          //     format.timestamp({
          //       format: 'DD-MM-YYYY HH:mm:ss',
          //     }),
          //     format.json(),
          //   ),
          //   datePattern: 'DD-MM-YYYY',
          //   zippedArchive: true,
          //   maxFiles: '30d',
          // }),
        ]
      : [
          new transports.Console({
            format: format.combine(
              format.cli(),
              format.splat(),
              format.timestamp(),
              format.printf((info) => {
                return `${info.timestamp} ${info.level}: ${info.message}`;
              }),
            ),
          }),
        ]),
  ],
});
