import { App } from './app';
import { logger } from './common/utils/logger.util';
import { envConfig } from './common/config/env.config';
import { ct } from './common/constants';
import { gracefulShutdown } from './common/utils/graceful-shutdown';

const { PORT, NODE_ENV, isDev, isProd } = envConfig;

function server() {
  const app = new App().init();

  const server = app.listen(PORT, () => {
    logger.info(`Express Server started successfully in ${NODE_ENV} mode.`);

    if (isDev) {
      logger.info(`API available at '${ct.base_url}'`);
      logger.info("Swagger UI available at 'http://localhost:3000/api-docs'");
    }
  });

  // Graceful shutdown in case of SIGINT (Ctrl+C) or SIGTERM (Docker)
  if (isProd) {
    process.on('SIGINT', gracefulShutdown.bind(null, server));
    process.on('SIGTERM', gracefulShutdown.bind(null, server));
  }
}
server();
