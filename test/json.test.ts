import express from "express";
import request from "supertest";
import ExpressRouteCache from "../src";

const app = express();
const erc = new ExpressRouteCache();

const testPath = "/json-test";
const slowTestPath = "/json-test-slow";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let hits = 0;
app.get(testPath, erc.cache(5), (req, res) => res.json({ hits: ++hits }));

app.get(slowTestPath, erc.cache(5), async (req, res) => {
  await sleep(50);
  res.json({ hits: ++hits });
});

describe("JSON", () => {
  afterEach(() => {
    erc.flush();
    hits = 0;
  });

  it("sends response as expected on first query", async () => {
    await request(app)
      .get(testPath)
      .expect("Content-Type", /json/)
      .then((res) => expect(res.body).toEqual({ hits: 1 }));
  });

  it("returns cached response after first requests", async () => {
    await request(app).get(testPath);
    await request(app).get(testPath);

    await request(app)
      .get(testPath)
      .expect("Content-Type", /json/)
      .then((res) => expect(res.body).toEqual({ hits: 1 }));
  });

  it("queues requests while calculating an uncached response", async () => {
    const [one, two, three, four] = await Promise.all([
      request(app).get(slowTestPath),
      request(app).get(slowTestPath),
      request(app).get(slowTestPath),
      request(app).get(slowTestPath),
    ]);

    expect(hits).toBe(1);

    expect(one.body).toStrictEqual({ hits: 1 });
    expect(two.body).toStrictEqual({ hits: 1 });
    expect(three.body).toStrictEqual({ hits: 1 });
    expect(four.body).toStrictEqual({ hits: 1 });
  });
});
