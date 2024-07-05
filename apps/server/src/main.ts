import { App } from './app';
import { logger } from './common/winston.logger';
import { envConfig } from './config/env.config';
import { ct } from './constants';

const { PORT, NODE_ENV, isDev } = envConfig;

function bootstrap() {
  const app = new App().init();

  app.listen(PORT, () => {
    logger.info(`=> Express Server started successfully in ${NODE_ENV} mode.`);

    if (isDev) {
      logger.info(`=> API available at '${ct.base_url}'`);
      logger.info(
        "=> Swagger UI available at 'http://localhost:3000/api-docs'\n",
      );
    }
  });
}
bootstrap();
