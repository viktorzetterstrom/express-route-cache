import express from "express";
import request from "supertest";
import ExpressRouteCache from "../src";

const app = express();
const erc = new ExpressRouteCache();

const testPath = "/json-test";

let hits = 0;
app.get(testPath, erc.cache(), (req, res) => res.json({ hits: ++hits }));

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
});
