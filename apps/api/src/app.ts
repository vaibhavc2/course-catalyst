import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { envConfig } from './config/env.config';
import { ct } from './constants';

const { CLIENT_URL, isDev } = envConfig;

export class App {
  public app: Application;

  constructor() {
    // creating express app
    this.app = express();
  }

  public init() {
    // initializing express app
    this.initApp();

    // returning express app
    return this.app;
  }

  private initApp() {
    // setting express app variables
    this.configApp();

    // using pre-built middlewares
    this.useMiddlewares();

    // using routing
    this.useRouting();
  }

  private configApp() {
    this.app.disable('x-powered-by'); // disable x-powered-by header

    // setting express app variables
    this.app.set('json spaces', 2); // pretty print JSON responses
    // this.app.set('trust proxy', true); // trust first proxy (only use if using a proxy server (reverse proxy))
  }

  private useMiddlewares() {
    // using pre-built middlewares
    this.app.use(
      cors({
        origin: [CLIENT_URL],
        credentials: true,
        methods: ct.corsMethods,
      }),
      helmet(),
      cookieParser(),
      express.json({
        limit: ct.expressLimit,
      }),
      express.urlencoded({ extended: true, limit: ct.expressLimit }),
      express.static('public'),
    );

    // // setting app version
    // this.app.use(middlewares.versioning.supplyAppVersion);

    // logs requests in development mode
    if (isDev) this.app.use(morgan('combined'));

    // // error handler middlewares
    // this.app.use(
    //   middlewares.error.routeNotFound,
    //   middlewares.error.logger,
    //   middlewares.error.handler,
    // );
  }

  private useRouting() {
    // new Router(this.app).init();
  }
}
