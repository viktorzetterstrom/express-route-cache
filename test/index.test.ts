import RouteCache from "../src";

test("Hello, World!", () => {
  const routeCache = new RouteCache();
  expect(routeCache.str).toBe("Hello, World!");
});
