import express from "express";
import request from "supertest";
import ExpressRouteCache from "../src";

const app = express();
const erc = new ExpressRouteCache();

const testPath = "/json-test";
const slowTestPath = "/json-test-slow";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let hits = 0;
app.get(testPath, erc.cache(5), (_, res) => res.send(`hits: ${++hits}`));

app.get(slowTestPath, erc.cache(5), async (req, res) => {
  await sleep(50);
  res.send(`hits: ${++hits}`);
});

describe("Send", () => {
  afterEach(() => {
    erc.flush();
    hits = 0;
  });

  it("sends response as expected on first query", async () => {
    await request(app)
      .get(testPath)
      .then((res) => expect(res.text).toEqual("hits: 1"));
  });

  it("returns cached response after first requests", async () => {
    await request(app).get(testPath);
    await request(app).get(testPath);

    await request(app)
      .get(testPath)
      .then((res) => expect(res.text).toEqual("hits: 1"));
  });

  it("queues requests while calculating an uncached response", async () => {
    const [one, two, three, four] = await Promise.all([
      request(app).get(slowTestPath),
      request(app).get(slowTestPath),
      request(app).get(slowTestPath),
      request(app).get(slowTestPath),
    ]);

    expect(hits).toBe(1);

    expect(one.text).toEqual("hits: 1");
    expect(two.text).toEqual("hits: 1");
    expect(three.text).toEqual("hits: 1");
    expect(four.text).toEqual("hits: 1");
  });
});
