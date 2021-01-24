import { NextFunction, Request, Response } from "express";
import { ICache, InMemoryCache } from "./cache";

class ExpressRouteCache {
  private _cache: ICache;

  constructor() {
    this._cache = new InMemoryCache();
  }

  cache() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const cacheKey = req.originalUrl;

      const cachedData = await this._cache.get(cacheKey);

      next();
    };
  }

  addToCache(key: string, value: any, ttl: number) {
    this._cache.set(key, value, ttl);
  }
}

export default ExpressRouteCache;
