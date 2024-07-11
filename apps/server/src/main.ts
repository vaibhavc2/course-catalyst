import { App } from './app';
import { logger } from './common/winston.logger';
import { envConfig } from './config/env.config';
import { ct } from './constants';
import { gracefulShutdown } from './functions/graceful-shutdown';

const { PORT, NODE_ENV, isDev, isProd } = envConfig;

function bootstrap() {
  const app = new App().init();

  const server = app.listen(PORT, () => {
    logger.info(`=> Express Server started successfully in ${NODE_ENV} mode.`);

    if (isDev) {
      logger.info(`=> API available at '${ct.base_url}'`);
      logger.info(
        "=> Swagger UI available at 'http://localhost:3000/api-docs'\n",
      );
    }
  });

  // Graceful shutdown in case of SIGINT (Ctrl+C) or SIGTERM (Docker)
  if (isProd) {
    process.on('SIGINT', gracefulShutdown.bind(null, server));
    process.on('SIGTERM', gracefulShutdown.bind(null, server));
  }
}
bootstrap();
