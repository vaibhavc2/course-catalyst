import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import envConfig from './common/config/env.config';
import ct from './common/constants';
import Docs from './common/middlewares/docs.middleware';
import errorMiddleware from './common/middlewares/error.middleware';
import { globalApiRateLimiter } from './common/middlewares/rate-limiter.middleware';
import versionMiddleware from './common/middlewares/version.middleware';
import requestLogger from './common/middlewares/request-logger.middleware';
import apiRouter from './routes/global.routes';
import { errorEmitter } from './common/utils/error-extras.util';

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

    // error handling
    this.errorHandling();

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
    this.app.use(versionMiddleware.supplyAppVersionHeader);

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
  }

  private errorHandling() {
    const { routeNotFound, logger, handler } = errorMiddleware;

    // catch errors emitted by the errorEmitter
    errorEmitter.on('error', (error, req, res, next) => {
      handler(error, req, res, next);
    });

    // error handler middlewares //!!! should be the last middlewares
    this.app.use(routeNotFound, logger, handler);
  }
}
