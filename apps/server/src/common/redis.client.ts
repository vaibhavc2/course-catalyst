import { envConfig } from '@/config/env.config';
import { Redis } from 'ioredis';
import { logger } from './winston.logger';

const { REDIS_URL } = envConfig;

const redis = new Redis(REDIS_URL);

// Listen for the initial connect event
redis.on('connect', () => {
  logger.info('=> Connected to Redis Database!\n');
});

// Listen for the initial error event
redis.on('error', (err) => {
  logger.error('!! Redis connection error:', err);

  // Close the connection
  redis.disconnect();

  // Exit the process
  process.exit(1);
});

export default redis;
