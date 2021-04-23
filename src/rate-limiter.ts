export type RateLimiterResult = {
  valid: boolean;
  key: string;
  remaining: number;
  reset: number;
  wait: number;
};

export interface RateLimiter {
  /**
   * Delete all the details for this key
   */
  delete: (key: string) => Promise<boolean>;
  /**
   * Check if request is allowed for a key,
   * even if not allowed, this is counted as a request
   */
  check: (key: string) => Promise<RateLimiterResult>;
}
