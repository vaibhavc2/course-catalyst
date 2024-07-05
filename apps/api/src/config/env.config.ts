import dotenv from 'dotenv';
import * as env from 'env-var';

dotenv.config();

const config = {
  PORT: env.get('PORT').default('3000').asIntPositive(),
  HOST: env.get('HOST').default('localhost').asString(),
  NODE_ENV: env.get('NODE_ENV').default('development').asString(),
  COOKIE_EXPIRES_IN: env.get('COOKIE_EXPIRES_IN').default(1).asIntPositive(), // 1 day by default
  CLIENT_URL: env.get('CLIENT_URL').default('http://localhost:3001').asString(),
};

const extraConfig = {
  isDev: config.NODE_ENV === 'development',
  isProd: config.NODE_ENV === 'production',
};

export const envConfig = { ...config, ...extraConfig };
