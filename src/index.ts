import { RedisClient } from "redis";
import { MemoryRateLimiter } from "./memory-rate-limiter";
import { RateLimiter } from "./rate-limiter";
import { RedisRateLimiter } from "./redis-rate-limiter";

type RateLimitOptions = {
  // Redis Client
  redis?: RedisClient;
  interval: number;
  limit: number;
  delay?: number;
};

export function RateLimit(options: RateLimitOptions): RateLimiter {
  options.delay = options.delay || 0;
  if (options.redis) {
    return new RedisRateLimiter(
      options.redis,
      options.interval,
      options.limit,
      options.delay
    );
  } else {
    return new MemoryRateLimiter(
      options.interval,
      options.limit,
      options.delay
    );
  }
}
