# Express Route Cache

[![Current latest version](https://img.shields.io/npm/v/express-route-cache)](https://github.com/viktorzetterstrom/express-route-cache)
[![Downloads per week](https://img.shields.io/npm/dw/express-route-cache)](https://github.com/viktorzetterstrom/express-route-cache)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/express-route-cache)
[![GitHub issues](https://img.shields.io/github/issues/viktorzetterstrom/express-route-cache)](https://github.com/viktorzetterstrom/express-route-cache/issues)

Express middleware that caches your routes. This project is still under development and not stable, updates might contain breaking changes. Currently only works on methods `res.send` and `res.json`.

## Installation

- `npm install express-route-cache`
- `yarn add express-route-cache`

## Quick setup

```typescript
import express from "express";
import ExpressRouteCache from "express-route-cache";

const app = express();

const defaultTtl = 60 * 5;
const erc = new ExpressRouteCache(defaultTtl);

app.get("/default-ttl", erc.cache(), (req, res) => {
  res.send("This route is now cached for 5 minutes");
});

app.get("/specified-ttl", erc.cache(30), (req, res) => {
  res.send("This route is now cached for 30 seconds");
});
```

## API description

```typescript
class ExpressRouteCache {
  // Default TTL is 60 seconds
  constructor(defaultTtlSeconds: number);

  // Primary function used for caching routes.
  // TTL is set to defaultTtlSeconds if not specified.
  // req.originalUrl (path + query params) is used as the cache key
  cache(ttlSeconds: number): NodeMiddlewareFn;

  // Use to see if cache contains cachekey
  async has(cacheKey: string): Promise<Boolean>;

  // Use to delete a certain cachekey
  async del(cacheKey: string): Promise<Boolean>;

  // Use to flush entire cache
  async flush(): Promise: void
}
```
