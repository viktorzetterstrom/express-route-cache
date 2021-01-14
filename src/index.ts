import { NextFunction, Request, Response } from "express";

class RouteCache {
  str = "Hello, World!";
  cache() {
    return (req: Request, res: Response, next: NextFunction) => {
      next();
    };
  }
}

export default RouteCache;
