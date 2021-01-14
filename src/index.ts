import NodeCache from "node-cache";
import { NextFunction, Request, Response } from "express";

class RouteCache {
  str = "Hello, World!";
  private _cache = new NodeCache();

  cache() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const cacheKey = req.path;
      const cachedData = await this._cache.get(cacheKey);

      if (cachedData) return res.send(cachedData);
      next();
    };
  }

  addToCache(key: string, value: any, ttl: number) {
    this._cache.set(key, value, ttl);
  }
}

export default RouteCache;
