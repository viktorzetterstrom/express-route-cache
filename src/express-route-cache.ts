import { NextFunction, Request, Response, Send } from "express";
import { ICache, InMemoryCache } from "./cache";

declare global {
  namespace Express {
    export interface Response {
      _originalJson: Send;
    }
  }
}

interface CachedResponse {
  sendFn: "json" | "send";
  body: any;
}

export class ExpressRouteCache {
  public static readonly DEFAULT_TTL_SECONDS = 60;
  private _cache: ICache;
  private _defaultTtlSeconds: number;

  constructor(defaultTtlSeconds = ExpressRouteCache.DEFAULT_TTL_SECONDS) {
    this._cache = new InMemoryCache();
    this._defaultTtlSeconds = defaultTtlSeconds;
  }

  cache(ttlSeconds: number = this._defaultTtlSeconds) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const cacheKey = req.originalUrl;

      const cachedResponse = await this._cache.get<CachedResponse>(cacheKey);
      if (cachedResponse !== undefined) {
        const { sendFn, body } = cachedResponse;
        return res[sendFn](body);
      }

      res._originalJson = res.json;
      res.json = (body) => {
        this._cache.set<CachedResponse>(
          cacheKey,
          { sendFn: "json", body },
          ttlSeconds
        );
        return res._originalJson(body);
      };

      next();
    };
  }

  async has(cacheKey: string) {
    return this._cache.has(cacheKey);
  }

  async del(cacheKey: string) {
    return this._cache.del(cacheKey);
  }

  async flush() {
    return this._cache.flush();
  }
}
