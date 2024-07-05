import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger-output.json';
import { errorMiddleware } from './api/middlewares/error.middleware';
import { supplyAppVersionHeader } from './api/middlewares/version.middleware';
import apiV1Router from './api/router/v1';
import { envConfig } from './config/env.config';
import { ct } from './constants';

const { CLIENT_URL, isDev } = envConfig;

export class App {
  private app: Application;

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

    // register middlewares and routes
    this.registerMiddlewaresAndRoutes();
  }

  private configApp() {
    this.app.disable('x-powered-by'); // disable x-powered-by header

    // setting express app variables
    this.app.set('json spaces', 2); // pretty print JSON responses
    // this.app.set('trust proxy', true); // trust first proxy (only use if using a proxy server (reverse proxy))
  }

  private registerMiddlewaresAndRoutes() {
    // using pre-built middlewares
    this.app.use(
      cors({
        // enabling CORS
        origin: [CLIENT_URL],
        credentials: true,
        methods: ct.corsMethods,
      }),
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

    // logs requests in development mode
    if (isDev) this.app.use(morgan('combined'));

    // api documentation: Swagger UI : http://localhost:3000/api-docs
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, ct.swaggerOptions),
    );

    // use routing of the app
    this.useRouting();

    // error handler middlewares //!!! should be the last middlewares
    this.app.use(
      errorMiddleware.routeNotFound,
      errorMiddleware.logger,
      errorMiddleware.handler,
    );
  }

  private useRouting() {
    this.app.use('/api/v1', apiV1Router);
  }
}
