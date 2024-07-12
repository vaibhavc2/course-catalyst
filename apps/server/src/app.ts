import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { envConfig } from './config/env.config';
import { ct } from './constants';
import { requestLogger } from './functions/request-logger';
import { Docs } from './middlewares/docs.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { globalApiRateLimiter } from './middlewares/rate-limiter.middleware';
import { supplyAppVersionHeader } from './middlewares/version.middleware';
import apiRouter from './router';
import { swaggerSpec } from './common/docs/swagger.options';

const { isDev } = envConfig;

export class App {
  private app: Application;

  constructor() {
    // creating express app
    this.app = express();
  }

  public init() {
    // initializing express app
    this.config();

    // returning express app
    return this.app;
  }

  private config() {
    this.app.disable('x-powered-by'); // disable x-powered-by header

    // setting express app variables
    this.app.set('json spaces', 2); // pretty print JSON responses
    // this.app.set('trust proxy', true); // trust first proxy (only use if using a proxy server (reverse proxy))

    // using pre-built middlewares
    this.app.use(
      cors(ct.corsOptions), // enable CORS for all requests
      helmet(), // secure express app by setting various HTTP headers
      cookieParser(), // parse cookies
      express.json({
        // parse JSON bodies
        limit: ct.expressLimit,
      }),
      // express.static('public'), // serving static files
      express.urlencoded({ extended: true, limit: ct.expressLimit }), // parse URL-encoded bodies
    );

    // setting app version header
    this.app.use(supplyAppVersionHeader);

    // rate limiter: api rate limiter (throttling)
    this.app.use(globalApiRateLimiter); // global rate limiter

    // logs error requests in development mode
    if (isDev) this.app.use(morgan(requestLogger, ct.morganOptions));

    // use the api router: all api routes (global router)
    this.app.use('/', apiRouter);

    // api documentation: Swagger UI : http://localhost:3000/api-docs
    const { swaggerUi, swaggerUiSetup, secureDocs, serveDocs } = Docs;
    this.app.use('/api-docs', secureDocs, swaggerUi, swaggerUiSetup); // serve Swagger UI, only in non-production environments (secureDocs middleware)
    serveDocs(this.app);

    console.log(swaggerSpec); //!!! remove this line : DEBUGGING

    // error handler middlewares //!!! should be the last middlewares
    const { routeNotFound, logger, handler } = errorMiddleware;
    this.app.use(routeNotFound, logger, handler);
  }
}
