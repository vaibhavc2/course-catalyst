import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerDefinition } from './swagger.def';

// Options for swagger-jsdoc
export const swaggerOptions: swaggerJSDoc.Options = {
  failOnErrors: true,
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/**/*.ts'), // Matches all files in 'routes' folders and subfolders
    path.join(__dirname, '../api/v1/**/*routes.ts'), // Matches any 'routes.ts' files in 'v1' folders and subfolders
    path.join(__dirname, '../api/v2/**/*routes.ts'), // Matches any 'routes.ts' files in 'v2' folders and subfolders
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
