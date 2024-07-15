import { ct } from '#/common/constants';
import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.0',
  info: {
    title: `LMS: ${ct.appName} - Express API Documentation`,
    version: ct.appVersion,
    description: ct.appDescription,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server - Api V1',
    },
    {
      url: 'http://localhost:3000/api/v2',
      description: 'Development server - Api V2',
    },
  ],
};
