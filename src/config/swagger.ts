import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Auth Service API',
    version: '1.0.0',
    description: 'API Documentation for Auth Service',
  },
  servers: [
    {
      url: 'http://localhost:1625/v2/api',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & token management' },
    { name: 'Roles', description: 'Role management (admin-only)' },
    { name: 'Sessions', description: 'Session management' },
    { name: 'SSO', description: 'OAuth 2.0 / SSO endpoints' },
    { name: 'Health', description: 'Service health check' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          transactionId: { type: 'string' },
          message: { type: 'string' },
          data: { type: 'object' },
          error: { type: 'string' },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
