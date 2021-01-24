import NodeCache from "node-cache";
import { ICache } from "./icache";

type seconds = number;

export class InMemoryCache implements ICache {
  private _cache = new NodeCache();

  public async get<T>(key: string): Promise<T | undefined> {
    return this._cache.get<T>(key);
  }

  public async set<T>(key: string, value: T, ttl: seconds) {
    return this._cache.set<T>(key, value, ttl);
  }

  public async del(key: string): Promise<boolean> {
    const deleted = this._cache.del(key);
    return deleted > 0;
  }

  public async has(key: string): Promise<boolean> {
    return this._cache.has(key);
  }
}
