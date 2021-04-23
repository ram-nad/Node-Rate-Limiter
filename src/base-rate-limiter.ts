import { RateLimiterResult } from "./rate-limiter";

export class BaseRateLimiter {
  protected limit: number;
  protected delay: number;
  protected interval: number;

  /**
   * @param interval The interval (in milliseconds) after which limit resets
   * @param delay The amount of delay between subsequent requests
   * @param limit The number of allowed requests in a second
   */
  constructor(interval: number, limit: number, delay: number) {
    this.interval = Math.floor(interval);
    this.limit = Math.floor(limit);
    this.delay = Math.floor(delay);

    if (interval <= 0 || delay < 0) {
      throw new Error(
        "Invalid Argument: interval > 0 and delay >= 0 is required"
      );
    }

    if (limit <= 0) {
      throw new Error("Invalid Argument: limit > 0 is required");
    }
  }

  calculate(key: string, now: number, ts: Array<number>): RateLimiterResult {
    const limitExceed = ts.length > this.limit;
    const delayViolated =
      ts.length > 1 ? now - ts[ts.length - 2] < this.delay : false;
    const waitForDelay = delayViolated
      ? ts[ts.length - 2] + this.delay - now
      : 0;
    const waitForRefill = limitExceed
      ? ts[ts.length - this.limit] + this.interval - now
      : 0;
    const wait = Math.max(waitForDelay, waitForRefill);
    const reset = ts.length > 0 ? ts[ts.length - 1] + this.interval : now;
    const remaining = Math.max(0, this.limit - ts.length);

    const result: RateLimiterResult = {
      key: key,
      valid: !(limitExceed || delayViolated),
      remaining: remaining,
      reset: reset,
      wait: wait,
    };

    return result;
  }
}
