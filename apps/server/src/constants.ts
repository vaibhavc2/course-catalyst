import { envConfig } from '@/config/env.config';
import chalk from 'chalk';
import { Request, Response } from 'express';
import { Options } from 'express-rate-limit';

const { isDev, HOST, PORT, COOKIE_EXPIRES_IN, CLIENT_URL } = envConfig;

const corsMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

export const ct = {
  expressLimit: '50mb',
  corsMethods,
  corsOptions: {
    origin: [CLIENT_URL],
    credentials: true,
    methods: corsMethods,
  },
  chalk: {
    success: chalk.bold.green,
    error: chalk.bold.red,
    warning: chalk.bold.yellow,
    highlight: chalk.bold.blue,
    blue: chalk.blue,
    red: chalk.red,
    green: chalk.green,
    yellow: chalk.yellow,
  },
  base_url: `${isDev ? 'http' : 'https'}://${HOST}${isDev ? ':' + PORT : ''}`,
  rateLimitOptions: {
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below. //TODO: Implement store
  } as Partial<Options>,
  swaggerOptions: {
    explorer: true,
    validatorUrl: null,
    // customCss: '.swagger-ui .topbar { display: none }',
  },
  morganOptions: {
    skip: (req: Request, res: Response) => res.statusCode === 304, // skip logging for 304 responses (Not Modified): swagger-ui
  },
  cookieOptions: {
    auth: {
      maxAge: 1000 * 60 * 60 * 24 * COOKIE_EXPIRES_IN, // 30 days by default
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as boolean | 'strict' | 'lax' | 'none' | undefined,
      // sameSite: 'Strict' as 'Lax' | 'None' | 'Strict',
    },
  },
};
