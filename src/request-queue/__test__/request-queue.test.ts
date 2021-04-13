import { RequestQueue } from "../request-queue";

describe("RequestQueue", () => {
  it("stores request for running later with drain-method", () => {
    const arr: number[] = [];
    let num = 0;

    const queue = new RequestQueue();
    queue.add("test", () => arr.push(num++));
    queue.add("test", () => arr.push(num++));
    queue.add("test", () => arr.push(num++));
    expect(arr).toEqual([]);

    queue.drain("test");
    expect(arr).toEqual([0, 1, 2]);
  });

  it("can flush the queue without running requests", () => {
    const arr: number[] = [];
    let num = 0;

    const queue = new RequestQueue();
    queue.add("test", () => arr.push(num++));
    queue.add("test", () => arr.push(num++));
    queue.add("test", () => arr.push(num++));
    expect(arr).toEqual([]);

    queue.flush("test");
    queue.drain("test");
    expect(arr).toEqual([]);
  });

  it("tells you if it has a key with the has-method", () => {
    const queue = new RequestQueue();
    queue.add("test", () => {});
    expect(queue.has("test")).toBe(true);
  });
});
