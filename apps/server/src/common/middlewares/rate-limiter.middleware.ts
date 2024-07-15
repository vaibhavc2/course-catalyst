import { ct } from '#/common/constants';
import { redis } from '#/common/services/redis.service';
import rateLimit, { Store } from 'express-rate-limit';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';

interface ClientRateLimitInfo {
  totalHits: number;
  remainingHits: number;
  resetTime: Date;
}

class RedisStore implements Store {
  private rateLimiter: RateLimiterRedis;

  constructor(rateLimiter: RateLimiterRedis) {
    this.rateLimiter = rateLimiter;
  }

  // Implement the increment method required by express-rate-limit's Store interface
  increment(key: string): Promise<ClientRateLimitInfo> {
    return new Promise((resolve, reject) => {
      this.rateLimiter
        .consume(key)
        .then((rateLimiterRes: RateLimiterRes) => {
          const resetTime = new Date(Date.now() + rateLimiterRes.msBeforeNext);
          resolve({
            totalHits: rateLimiterRes.consumedPoints,
            remainingHits: rateLimiterRes.remainingPoints,
            resetTime: resetTime,
          });
        })
        .catch((rejRes) => {
          if (rejRes instanceof Error) {
            reject(rejRes);
          } else {
            const resetTime = new Date(Date.now() + rejRes.msBeforeNext);
            resolve({
              totalHits: rejRes.consumedPoints,
              remainingHits: rejRes.remainingPoints,
              resetTime: resetTime,
            });
          }
        });
    });
  }

  // Implement the decrement method (might not be necessary depending on your rate limiting strategy)
  decrement(key: string): void {
    // Not always necessary to implement this method, especially here.
  }

  // Reset key is not directly supported by RateLimiterRedis, but you can implement it if needed
  resetKey(key: string): void {
    this.rateLimiter.delete(key);
  }
}

const redisStoreGlobal = new RateLimiterRedis({
  storeClient: redis,
  points: ct.rateLimiter.global.requests, // Number of requests
  duration: ct.rateLimiter.global.duration, // Per windowMs, say, it's 60 seconds
});

const redisStoreSensitive = new RateLimiterRedis({
  storeClient: redis,
  points: ct.rateLimiter.sensitive.requests, // Number of requests for sensitive route
  duration: ct.rateLimiter.sensitive.duration, // Per windowMs, say, it's 60 seconds
});

// redis store adapter instances
const redisStoreGlobalAdapter = new RedisStore(redisStoreGlobal);
const redisStoreSensitiveAdapter = new RedisStore(redisStoreSensitive);

export const globalApiRateLimiter = rateLimit({
  windowMs: ct.rateLimiter.global.duration * 1000, // (* 1000) to convert into milliseconds
  limit: ct.rateLimiter.global.requests, // Limit each IP to x requests per `window` (say, per 1 minute(s)).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: 'Too many requests from this IP, please try again after a minute.',
  skip: (req, res) => req.ip === '::1', // Skip rate limiting for localhost
  store: redisStoreGlobalAdapter, // Use the custom RedisStore adapter, can skip store, but store with redis improves performance
});

export const sensitiveRouteRateLimiter = rateLimit({
  windowMs: ct.rateLimiter.sensitive.duration * 1000, // (* 1000) to convert into milliseconds
  max: ct.rateLimiter.sensitive.requests, // Limit each IP to x requests per `window` (say, per 1 minute(s)).
  message: 'Too many requests from this IP, please try again after a minute.',
  skip: (req, res) => req.ip === '::1', // Skip rate limiting for localhost
  store: redisStoreSensitiveAdapter, // Use the custom RedisStore adapter, can skip store, but store with redis improves performance
});
