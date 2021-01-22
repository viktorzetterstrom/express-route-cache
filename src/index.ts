import { NextFunction, Request, Response } from "express";
import { InMemoryCache } from "./cache";

class ExpressRouteCache {
  private _cache = new InMemoryCache();

  cache() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const cacheKey = req.originalUrl;

      const cachedData = await this._cache.get(cacheKey);

      if (cachedData) return res.send(cachedData);
      next();
    };
  }

  addToCache(key: string, value: any, ttl: number) {
    this._cache.set(key, value, ttl);
  }
}

export default ExpressRouteCache;
