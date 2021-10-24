import { NextFunction, Request, Response, Send } from "express";
import { ICache, InMemoryCache } from "./cache";
import { RequestQueue } from "./request-queue";

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

interface ExpressRouteCacheConfig {
  cache?: ICache;
}

let count = 0;

export class ExpressRouteCache {
  private cacher: ICache;
  queue: RequestQueue;

  constructor(config: ExpressRouteCacheConfig = {}) {
    this.cacher = config.cache || new InMemoryCache();
    this.queue = new RequestQueue();
  }

  cache(ttlSeconds: number) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const cacheKey = req.originalUrl;

      const cacheResponse = await this.cacher.get<CacheResponse>(cacheKey);
      if (cacheResponse !== undefined) {
        if (cacheResponse.json) return res.json(cacheResponse.body);
        return res.send(cacheResponse.body);
      }

      if (this.queue.has(cacheKey)) {
        this.queue.add(cacheKey, async () => {
          const cacheResponse = await this.cacher.get<CacheResponse>(cacheKey);
          if (cacheResponse !== undefined) {
            if (cacheResponse.json) return res.json(cacheResponse.body);
            return res.send(cacheResponse.body);
          }
        });

        return;
      }

      res._originalSend = res.send;
      res._originalJson = res.json;

      if (!this.queue.has(cacheKey)) this.queue.init(cacheKey);

      let wasCached = false;
      const sender = ({ body, json }: CacheResponse) => {
        if (res.statusCode < 400) {
          this.cacher.set<CacheResponse>(cacheKey, { body, json }, ttlSeconds);
        }

        wasCached = true;
        this.queue.drain(cacheKey);

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
    return this.cacher.has(cacheKey);
  }

  async del(cacheKey: string) {
    return this.cacher.del(cacheKey);
  }

  async flush() {
    return this.cacher.flush();
  }
}
