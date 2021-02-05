import { NextFunction, Request, Response, Send } from "express";
import { ICache, InMemoryCache } from "./cache";

declare global {
  namespace Express {
    export interface Response {
      _originalJson: Send;
      _originalSend: Send;
    }
  }
}

interface CacheResponse {
  json?: boolean;
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

      const cachedResponse = await this._cache.get<CacheResponse>(cacheKey);
      if (cachedResponse !== undefined) {
        if (cachedResponse.json) return res.json(cachedResponse.body);
        return res.send(cachedResponse.body);
      }

      res._originalSend = res.send;
      res._originalJson = res.json;

      let wasCached = false;
      const sender = ({ body, json }: CacheResponse) => {
        if (res.statusCode < 400) {
          this._cache.set<CacheResponse>(cacheKey, { body, json }, ttlSeconds);
        }

        wasCached = true;

        if (json) return res._originalJson(body);
        return res._originalSend(body);
      };

      res.send = (body) =>
        wasCached ? res._originalSend(body) : sender({ body });

      res.json = (body) => sender({ body, json: true });

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

export default ExpressRouteCache;
