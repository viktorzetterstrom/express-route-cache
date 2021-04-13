import express from "express";
import request from "supertest";
import ExpressRouteCache from "../src";

const app = express();
const erc = new ExpressRouteCache();

const cachedPath = "/json-test";

let hits = 0;
app.get(cachedPath, erc.cache(5), (_, res) => res.send(`hits: ${++hits}`));

describe("Send", () => {
  afterEach(() => {
    erc.flush();
    hits = 0;
  });

  it("sends response as expected on first query", async () => {
    await request(app)
      .get(cachedPath)
      .then((res) => expect(res.text).toEqual("hits: 1"));
  });

  it("returns cached response after first requests", async () => {
    await request(app).get(cachedPath);
    await request(app).get(cachedPath);

    await request(app)
      .get(cachedPath)
      .then((res) => expect(res.text).toEqual("hits: 1"));
  });
});
