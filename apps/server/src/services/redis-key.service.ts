import { REDIS_KEY_PREFIXES } from '#/common/entities/enums/redis-keys.enums';

class RedisKeyService {
  getActivationKey(email: string): string {
    return `${REDIS_KEY_PREFIXES.ACTIVATION}${email}`;
  }

  getSessionKey(userId: string): string {
    return `${REDIS_KEY_PREFIXES.SESSION}${userId}`;
  }
}

export const redisKey = new RedisKeyService();
