import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0', // OpenAPI version
  info: {
    title: 'Auth Service API',
    version: '1.0.0',
    description: 'API Documentation for Auth Service',
  },
  servers: [
    {
      url: 'http://localhost:1625/v2/api', // Your base URL
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
