import { Application } from 'express';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { App } from './app';
import envConfig from './common/config/env.config';
import { ct } from './common/constants';
import prisma from './common/prisma.client';
import { redis } from './common/services/redis.service';
import { logger } from './common/utils/logger.util';

const { PORT, NODE_ENV, isDev, isProd } = envConfig;

type ExpressServer = Server<typeof IncomingMessage, typeof ServerResponse>;

class HTTPServer {
  private readonly app: Application;
  private server: ExpressServer;

  // bootstrap the express application and server
  constructor(appInstance: App) {
    this.app = appInstance.init();

    this.server = this.app.listen(PORT, () => {
      logger.info(`Express Server started successfully in ${NODE_ENV} mode.`);

      if (isDev) {
        logger.info(`API available at '${ct.base_url}'`);
        logger.info("Swagger UI available at 'http://localhost:3000/api-docs'");
      }
    });

    // Graceful shutdown in case of SIGINT (Ctrl+C) or SIGTERM (Docker)
    if (isProd) {
      process.on('SIGINT', this.gracefulShutdown.bind(null, 5000));
      process.on('SIGTERM', this.gracefulShutdown.bind(null, 5000));
    }
  }

  gracefulShutdown(
    waitTime: number = 5000, // Default wait time of 5 seconds
  ) {
    console.debug('\nSignal received: closing HTTP server...');

    // Stop accepting new connections
    this.server.close(async () => {
      console.debug('HTTP server closed gracefully.');

      try {
        await redis.quit(); // Close Redis connection

        await prisma.$disconnect(); // Close Prisma connection

        console.debug('Connections closed successfully.');
      } catch (error) {
        logger.error('Error while closing connections: ' + error);
      }
    });

    // Wait for ongoing requests to finish with a timeout
    setTimeout(() => {
      console.debug(
        `Waiting for ${waitTime / 1000} seconds for ongoing requests to complete...`,
      );
      // Optionally, forcefully terminate remaining connections here
    }, waitTime);
  }
}

const appInstance = new App();
new HTTPServer(appInstance);
