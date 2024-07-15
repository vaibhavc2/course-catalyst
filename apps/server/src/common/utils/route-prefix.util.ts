import { Router } from 'express';

class RoutePrefix {
  private readonly prefix: string;
  private readonly router: Router;

  constructor(prefix: string, router: Router) {
    this.prefix = prefix;
    this.router = router;
  }

  defineRoute(path: string, router: Router) {
    return this.router.use(`${this.prefix}${path}`, router);
  }
}

export const routePrefix = (prefix: string, router: Router) =>
  new RoutePrefix(prefix, router);
