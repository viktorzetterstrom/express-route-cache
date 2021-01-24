import { InMemoryCache } from "../in-memory-cache";
import { wait } from "../../../test/helpers";

const testData1 = { test: "Hello, World" } as const;
const testData2 = { test: "foo" } as const;
const testKey1 = "test-key";
const testKey2 = "additional-key";
const testKey3 = "another-key";
const ttl = 10;
const shortTtl = 0.05;

describe("InMemoryCache", () => {
  it("stores items that can be retrieved", async () => {
    const inMemoryCache = new InMemoryCache();

    const success = await inMemoryCache.set(testKey1, testData1, ttl);
    expect(success).toBe(true);

    const data = await inMemoryCache.get(testKey1);
    expect(data).toEqual(testData1);
  });

  it("overwrites stored value", async () => {
    const inMemoryCache = new InMemoryCache();

    await inMemoryCache.set(testKey1, testData1, ttl);
    await inMemoryCache.set(testKey1, testData2, ttl);

    const data = await inMemoryCache.get(testKey1);
    expect(data).toEqual(testData2);
  });

  it("can verify items exist in the cache", async () => {
    const inMemoryCache = new InMemoryCache();

    await inMemoryCache.set(testKey1, testData1, ttl);

    const exists = await inMemoryCache.has(testKey1);
    expect(exists).toEqual(true);
  });

  it("can delete items from the cache", async () => {
    const inMemoryCache = new InMemoryCache();

    await inMemoryCache.set(testKey1, testData1, ttl);
    const deleted = await inMemoryCache.del(testKey1);
    expect(deleted).toBe(true);

    const exists = await inMemoryCache.has(testKey1);
    const data = await inMemoryCache.get(testKey1);
    expect(exists).toEqual(false);
    expect(data).toBeUndefined();
  });

  it("returns false if item could not be deleted from the cache", async () => {
    const inMemoryCache = new InMemoryCache();

    const deleted = await inMemoryCache.del(testKey1);
    expect(deleted).toBe(false);
  });

  it("removes items after ttl has expired", async () => {
    const inMemoryCache = new InMemoryCache();

    await inMemoryCache.set(testKey1, testData1, shortTtl);
    const waitingTimeMs = shortTtl * 1000 + 10;
    await wait(waitingTimeMs);

    const exists = await inMemoryCache.has(testKey1);
    const data = await inMemoryCache.get(testKey1);
    expect(exists).toBe(false);
    expect(data).toBeUndefined();
  });

  it("removes all cached items with the flush function", async () => {
    const inMemoryCache = new InMemoryCache();

    await inMemoryCache.set(testKey1, testData1, ttl);
    await inMemoryCache.set(testKey2, testData2, ttl);
    await inMemoryCache.set(testKey3, testData1, ttl);

    await inMemoryCache.flush();

    expect(await inMemoryCache.has(testKey1)).toBe(false);
    expect(await inMemoryCache.has(testKey2)).toBe(false);
    expect(await inMemoryCache.has(testKey3)).toBe(false);
  });

  it("gives you all current keys with the keys function", async () => {
    const inMemoryCache = new InMemoryCache();

    await inMemoryCache.set(testKey1, testData1, ttl);
    await inMemoryCache.set(testKey2, testData2, ttl);
    await inMemoryCache.set(testKey3, testData1, ttl);

    const keys = await inMemoryCache.keys();
    expect(keys).toEqual([testKey1, testKey2, testKey3]);
  });
});
