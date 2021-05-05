## Example Usage

```ts
import RateLimit from "rate-limiter";

const rateLimiter = RateLimit({
  interval: INTERVAL,
  limit: LIMIT,
  delay: DELAY,
});

rateLimiter.check(id).then(console.log);
```

To use Redis pass `redis: RedisClient` to constructor.
