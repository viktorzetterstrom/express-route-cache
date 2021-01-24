export interface ICache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl: number): Promise<boolean>;
  has(key: string): Promise<boolean>;
  del(key: string): Promise<boolean>;
  flush(): Promise<void>;
  keys(): Promise<string[]>;
}
