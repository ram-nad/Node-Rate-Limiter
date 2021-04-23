import { RedisClient } from "redis";
import { BaseRateLimiter } from "./base-rate-limiter";
import { RateLimiter, RateLimiterResult } from "./rate-limiter";

export class RedisRateLimiter extends BaseRateLimiter implements RateLimiter {
  private client: RedisClient;

  constructor(
    redis: RedisClient,
    interval: number,
    limit: number,
    delay: number
  ) {
    super(interval, limit, delay);
    this.client = redis;
  }

  private getKey(key: string): string {
    return "rate-limiter-" + key;
  }

  check(key: string): Promise<RateLimiterResult> {
    const redisKey = this.getKey(key);
    const now = Date.now();

    const batch = this.client.multi();

    batch.zremrangebyscore(redisKey, "-inf", now - this.interval);
    batch.zadd(redisKey, now, now);
    batch.zrange(redisKey, 0, -1);
    batch.expire(redisKey, Math.ceil(this.interval / 1000));

    return new Promise<RateLimiterResult>((res, rej) => {
      batch.exec((err, results) => {
        if (err) rej(err);

        const ts: Array<number> = results[2].map(Number);
        const result = this.calculate(key, now, ts);
        res(result);
      });
    });
  }

  delete(key: string): Promise<boolean> {
    const redisKey = this.getKey(key);

    return new Promise<boolean>((res, rej) => {
      this.client.del(redisKey, (err, result) => {
        if (err) rej(err);
        res(result >= 0);
      });
    });
  }
}
