import dotenv from 'dotenv';
import * as env from 'env-var';

dotenv.config();

const config = {
  PORT: env.get('PORT').default('3000').asIntPositive(),
  HOST: env.get('HOST').default('localhost').asString(),
  NODE_ENV: env.get('NODE_ENV').default('development').asString(),
  COOKIE_EXPIRES_IN: env.get('COOKIE_EXPIRES_IN').default(7).asIntPositive(), // 7 days by default
  CLIENT_URL: env.get('CLIENT_URL').default('*').asString(), //! change in production
  APP_VERSION: env.get('APP_VERSION').default('1.0.0').asString(),
  REDIS_URL: env.get('REDIS_URL').default('redis://localhost:6379').asString(),
  RESEND_API_KEY: env.get('RESEND_API_KEY').required().asString(),
  EMAIL_FROM: env.get('EMAIL_FROM').required().asString(),
  ACCESS_TOKEN_SECRET: env.get('ACCESS_TOKEN_SECRET').required().asString(),
  ACCESS_TOKEN_EXPIRY: env.get('ACCESS_TOKEN_EXPIRY').default('1h').asString(),
  REFRESH_TOKEN_SECRET: env.get('REFRESH_TOKEN_SECRET').required().asString(),
  REFRESH_TOKEN_EXPIRY: env
    .get('REFRESH_TOKEN_EXPIRY')
    .default('7d')
    .asString(),
  ACTIVATION_TOKEN_SECRET: env
    .get('ACTIVATION_TOKEN_SECRET')
    .required()
    .asString(),
  ACTIVATION_TOKEN_EXPIRY: env
    .get('ACTIVATION_TOKEN_EXPIRY')
    .default('10m') // 10 minutes by default
    .asString(),
};

const extraConfig = {
  isDev: config.NODE_ENV === 'development',
  isProd: config.NODE_ENV === 'production',
};

export const envConfig = { ...config, ...extraConfig };
