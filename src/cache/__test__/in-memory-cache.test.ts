import { InMemoryCache } from "../in-memory-cache";
import { wait } from "../../../test/helpers";

const testData1 = { test: "Hello, World" } as const;
const testData2 = { test: "foo" } as const;
const testKey = "test-key";
const ttl = 10;
const shortTtl = 0.05;

describe("InMemoryCache", () => {
  it("stores items that can be retrieved", async () => {
    const inMemoryCache = new InMemoryCache();

    const success = await inMemoryCache.set(testKey, testData1, ttl);
    expect(success).toBe(true);

    const data = await inMemoryCache.get(testKey);
    expect(data).toEqual(testData1);
  });

  it("overwrites stored value", async () => {
    const inMemoryCache = new InMemoryCache();

    const success1 = await inMemoryCache.set(testKey, testData1, ttl);
    const success2 = await inMemoryCache.set(testKey, testData2, ttl);
    expect(success1).toBe(true);
    expect(success2).toBe(true);

    const data = await inMemoryCache.get(testKey);
    expect(data).toEqual(testData2);
  });

  it("can verify items exist in the cache", async () => {
    const inMemoryCache = new InMemoryCache();

    const success = await inMemoryCache.set(testKey, testData1, ttl);
    expect(success).toBe(true);

    const exists = await inMemoryCache.has(testKey);
    expect(exists).toEqual(true);
  });

  it("removes items after ttl has expired", async () => {
    const inMemoryCache = new InMemoryCache();

    const success = await inMemoryCache.set(testKey, testData1, shortTtl);
    expect(success).toBe(true);
    await wait(shortTtl * 1000 + 50);

    const exists = await inMemoryCache.has(testKey);
    const data = await inMemoryCache.get(testKey);
    expect(exists).toBe(false);
    expect(data).toBeUndefined();
  });
});
