import { envConfig } from '#/common/config/env.config';
import { swaggerSpec } from '#/docs/swagger.options';
import { ApiResponse } from '#/common/utils/api-response.util';
import { Application, NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

const { isProd } = envConfig;

export class Docs {
  static swaggerUi = swaggerUi.serve;

  static swaggerUiSetup = swaggerUi.setup(swaggerSpec, {
    // ??? extend the Swagger UI with custom CSS and JS if needed
    customCss: '.swagger-ui .topbar { display: none; }',
    // customCssUrl: '/swagger.css',
    // customJs: '/swagger.js',
  });

  static getSwaggerUi() {
    return Docs.swaggerUi;
  }

  static getSwaggerUiSetup() {
    return Docs.swaggerUiSetup;
  }

  // Middleware to secure Swagger documentation
  static secureDocs(req: Request, res: Response, next: NextFunction) {
    // Only enable in non-production environments
    if (!isProd) next();
    else return new ApiResponse(res).forbidden('Access denied!');
  }

  static serveDocs(app: Application) {
    return app.get('/docs.json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }
}
