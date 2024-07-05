import chalk from 'chalk';
import { envConfig } from './config/env.config';

const { isDev, HOST, PORT, COOKIE_EXPIRES_IN } = envConfig;

export const ct = {
  expressLimit: '50mb',
  corsMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  chalk: {
    success: chalk.bold.green,
    error: chalk.bold.red,
    warning: chalk.bold.yellow,
    highlight: chalk.bold.blue,
  },
  base_url: `${isDev ? 'http' : 'https'}://${HOST}${isDev ? ':' + PORT : ''}`,
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
