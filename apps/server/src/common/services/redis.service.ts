import { REDIS_KEY_PREFIXES } from '#/api/v1/entities/enums/redis-keys.enums';
import envConfig from '#/common/config/env.config';
import { asyncFnWrapper } from '#/common/utils/async-errors.util';
import { logger } from '#/common/utils/logger.util';
import { sanitizeParams } from '#/common/utils/sanitize.util';
import { Callback, Redis } from 'ioredis';

const { REDIS_URL } = envConfig;

export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(REDIS_URL);

    // Listen for the initial connect event
    this.redis.on('connect', () => {
      logger.info('Connected to Redis Database!');
    });

    // Listen for the error event
    this.redis.on('error', (err: any) => {
      logger.error('Redis connection error: ', err);

      if (this.isConnectionError(err)) {
        // Attempt to reconnect
        this.attemptReconnect();
      } else {
        // For other critical errors, disconnect and exit
        this.gracefulShutdown();
      }
    });
  }

  private isConnectionError(err: any): boolean {
    // Check for specific connection error codes or messages
    const connectionErrorCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'];
    return connectionErrorCodes.includes(err.code);
  }

  private attemptReconnect() {
    // exponential backoff strategy for reconnection attempts
    const reconnectDelay = 5000; // 5 seconds
    setTimeout(() => {
      logger.info('Attempting to reconnect to Redis...');
      this.redis.connect().catch((err) => {
        logger.error('Redis reconnection failed: ', err);
        this.gracefulShutdown(); // If reconnection fails, perform shutdown
      });
    }, reconnectDelay);
  }

  private async gracefulShutdown() {
    try {
      logger.info('Initiating graceful shutdown...');

      // Perform any necessary cleanup here
      await this.redis.quit(); // Close Redis connection

      logger.info('Shutdown complete. Exiting process.');
      process.exit(0); // Exit the process successfully
    } catch (err) {
      logger.error('Error during graceful shutdown: ', err);
      process.exit(1); // Exit the process with failure
    }
  }

  getRedisClient(): Redis {
    return this.redis;
  }

  /**
   * Generates a Redis key based on the provided key name and parameters.
   * Ensures that the key name is valid and sanitizes the parameters to prevent injection attacks.
   *
   * @param keyName The name of the key, which should correspond to a value in REDIS_KEY_PREFIXES.
   * @param params Parameters to be included in the key, such as userId or deviceId.
   * @returns A Redis key string.
   * @throws {Error} If the keyName is not valid.
   */
  static createKey(
    keyName: keyof typeof REDIS_KEY_PREFIXES,
    ...params: string[]
    // ...params: string[] | number[]
  ): string {
    const prefix = REDIS_KEY_PREFIXES[keyName];
    // if (!prefix) {
    //   throw new Error(`Invalid key name: ${keyName}`);
    // }
    // // Convert numbers to strings
    // for (let param of params) {
    //   if (typeof param !== 'string' && typeof param === 'number') {
    //     param = param.toString();
    //   }
    // }

    // Sanitize parameters to prevent injection attacks
    // const sanitizedParams = sanitizeParams(params as string[]);
    const sanitizedParams = sanitizeParams(params);

    return `${prefix}::${sanitizedParams.join('::')}`;
  }

  // private errorHandler = <T>(err: Error | null | undefined, res: T): void => {
  //   if (err) {
  //     logger.error('Redis error: ' + err);
  //     throw new Error(err.message);
  //   }
  // };

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string): Promise<string> {
    return await this.redis.set(key, value);
  }

  async del(
    keys: string[] | string,
    ...otherKeys: (string | null)[]
  ): Promise<number> {
    let delKeys = Array.isArray(keys) ? keys : [keys];

    if (otherKeys.length) {
      delKeys = delKeys.concat(otherKeys as string[]);
    }

    return await this.redis.del(...delKeys);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds);
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    return await this.redis.setex(key, seconds, value);
  }

  async setnx(key: string, value: string): Promise<number> {
    return await this.redis.setnx(key, value);
  }

  async hmset(key: string, values: Record<string, string>): Promise<'OK'> {
    return await this.redis.hmset(key, values);
  }

  async hmset_with_expiry(
    key: string,
    seconds: number,
    values: Record<string, string>,
  ): Promise<'OK'> {
    return await this.redis.hmset(
      key,
      values,
      asyncFnWrapper(async (err, res) => {
        if (err) {
          throw new Error(err.message);
        }

        await this.redis.expire(key, seconds);
      }),
    );
  }

  async hmget(key: string): Promise<(string | null)[]> {
    return await this.redis.hmget(key);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.redis.hset(key, field, value);
  }

  async hdel(key: string, field: string): Promise<number> {
    return await this.redis.hdel(key, field);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  async del_keys(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (!keys.length) return 0; // No keys found, nothing to delete
    return await this.del(keys);
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return await this.redis.mget(keys);
  }

  async get_values(pattern: string): Promise<(string | null)[]> {
    const keys = await this.keys(pattern);
    if (!keys.length) return []; // No keys found, return empty array
    return await this.mget(keys);
  }
}

export const redisService = new RedisService();
export const redis = redisService.getRedisClient();
