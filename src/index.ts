import NodeCache from "node-cache";
import { NextFunction, Request, Response } from "express";

class Cache {
  private _cache = new NodeCache();

  public async get<T>(key: string): Promise<T | undefined> {
    return this._cache.get<T>(key);
  }

  public async set<T>(key: string, value: T, ttl: number) {
    return this._cache.set<T>(key, value, ttl);
  }

  public async del(key: string): Promise<boolean> {
    const deleted = this._cache.del(key);
    return deleted > 0;
  }
}

class RouteCache {
  str = "Hello, World!";
  private _cache = new Cache();

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
