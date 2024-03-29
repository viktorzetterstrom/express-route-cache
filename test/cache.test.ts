import express from "express";
import request from "supertest";
import ExpressRouteCache from "../src";
import { wait } from "./helpers";

const app = express();
const erc = new ExpressRouteCache();

const testPath = "/json-test";
const testPathWithQueryParams = "/json-test?with_query_params=true";
const testPathWithShortTtl = "/json-test-short-ttl";

let hits = 0;
app.get(testPath, erc.cache(5), (req, res) => res.send("Hello, World!"));

const shortTtlSeconds = 0.01;
app.get(testPathWithShortTtl, erc.cache(shortTtlSeconds), (_, res) =>
  res.json({ ttl: "short" })
);

describe("Cache", () => {
  afterEach(() => {
    erc.flush();
    hits = 0;
  });

  it("by default the cachekey is path and query params", async () => {
    await request(app).get(testPathWithQueryParams);

    const existsWithoutQueryParams = await erc.has(testPath);
    const existsWithQueryParams = await erc.has(testPathWithQueryParams);
    expect(existsWithoutQueryParams).toBe(false);
    expect(existsWithQueryParams).toBe(true);
  });

  it("removes response after ttl as expired", async () => {
    await request(app).get(testPath);
    await request(app).get(testPathWithShortTtl);

    const waitingTimeMs = shortTtlSeconds * 1000 + 10;
    await wait(waitingTimeMs);

    const exists = await erc.has(testPath);
    const existsShortTtl = await erc.has(testPathWithShortTtl);
    expect(exists).toBe(true);
    expect(existsShortTtl).toBe(false);
  });

  it("cached routes can be cleared using the del function", async () => {
    await request(app).get(testPath);

    expect(await erc.has(testPath)).toBe(true);
    const deleted = await erc.del(testPath);
    expect(deleted).toBe(true);
    expect(await erc.has(testPath)).toBe(false);
  });

  it("returns false when trying to delete non-existing cacheKeys", async () => {
    const deleted = await erc.del(testPath);
    expect(deleted).toBe(false);
  });
});
