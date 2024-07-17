import { REDIS_KEY_PREFIXES } from '#/api/v1/entities/enums/redis-keys.enums';
import envConfig from '#/common/config/env.config';
import { asyncFnWrapper } from '#/common/utils/async-errors.util';
import { logger } from '#/common/utils/logger.util';
import { sanitizeParams } from '#/common/utils/sanitize.util';
import { Redis } from 'ioredis';

const { REDIS_URL } = envConfig;

export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(REDIS_URL);

    // Listen for the initial connect event
    this.redis.on('connect', () => {
      logger.info('Connected to Redis Database!');
    });

    // Listen for the initial error event
    this.redis.on('error', (err: any) => {
      logger.error('Redis connection error: ', err);

      // Close the connection
      this.redis.disconnect();

      // Exit the process
      process.exit(1);
    });
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
  ): string {
    const prefix = REDIS_KEY_PREFIXES[keyName];
    if (!prefix) {
      throw new Error(`Invalid key name: ${keyName}`);
    }

    // Sanitize parameters to prevent injection attacks
    const sanitizedParams = sanitizeParams(params);

    return `${prefix}::${sanitizedParams.join('::')}`;
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async set(key: string, value: string): Promise<string> {
    return await this.redis.set(key, value, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async del(
    keys: string[] | string,
    ...otherKeys: (string | null)[]
  ): Promise<number> {
    let delKeys = Array.isArray(keys) ? keys : [keys];

    if (otherKeys.length) {
      delKeys = delKeys.concat(otherKeys as string[]);
    }

    return await this.redis.del(...delKeys, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    return await this.redis.setex(key, seconds, value, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async setnx(key: string, value: string): Promise<number> {
    return await this.redis.setnx(key, value, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async hmset(key: string, values: Record<string, string>): Promise<'OK'> {
    return await this.redis.hmset(key, values, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
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

        await this.redis.expire(key, seconds, (err, res) => {
          if (err) {
            throw new Error(err.message);
          }
        });
      }),
    );
  }

  async hmget(key: string): Promise<(string | null)[]> {
    return await this.redis.hmget(key, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.redis.hset(key, field, value, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async hdel(key: string, field: string): Promise<number> {
    return await this.redis.hdel(key, field, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern, (err, res) => {
      if (err) {
        throw new Error(err.message);
      }
    });
  }

  async del_keys(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    return await this.del(keys);
  }
}

export const redisService = new RedisService();
export const redis = redisService.getRedisClient();
