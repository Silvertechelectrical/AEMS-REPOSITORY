import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KUSF AEMS API',
      version: '1.0.0',
      description: 'Swagger documentation for the KUSF Athlete Eligibility & Management System',
    },
  },
  apis: ['./src/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
