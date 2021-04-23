import { BaseRateLimiter } from "./base-rate-limiter";
import { RateLimiter, RateLimiterResult } from "./rate-limiter";

type Data = {
  [k: string]: Array<number>;
};

export class MemoryRateLimiter extends BaseRateLimiter implements RateLimiter {
  private data: Data;

  constructor(interval: number, limit: number, delay: number) {
    super(interval, limit, delay);
    this.data = {};
  }

  check(key: string): Promise<RateLimiterResult> {
    const now = Date.now();

    return new Promise<RateLimiterResult>((res) => {
      this.data[key] = this.data[key] || [];
      this.data[key] = this.data[key].filter(
        (val) => val > now - this.interval
      );
      this.data[key].push(now);

      const ts = this.data[key];
      const result = this.calculate(key, now, ts);
      res(result);
    });
  }

  delete(key: string): Promise<boolean> {
    return new Promise<boolean>((res) => {
      if (this.data[key]) {
        delete this.data[key];
        res(true);
      }

      res(false);
    });
  }
}
