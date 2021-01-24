import NodeCache from "node-cache";
import { ICache } from "./icache";

export class InMemoryCache implements ICache {
  private _cache = new NodeCache();

  public async get<T>(key: string): Promise<T | undefined> {
    return this._cache.get<T>(key);
  }

  public async set<T>(key: string, value: T, ttlSeconds: number) {
    return this._cache.set<T>(key, value, ttlSeconds);
  }

  public async has(key: string): Promise<boolean> {
    return this._cache.has(key);
  }

  public async del(key: string): Promise<boolean> {
    const deleted = this._cache.del(key);
    return deleted > 0;
  }

  public async flush(): Promise<void> {
    return this._cache.flushAll();
  }

  public async keys(): Promise<string[]> {
    return this._cache.keys();
  }
}
