const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CrisisDesk AI API',
      version: '1.0.0',
      description: 'AI-powered emergency and service request triage backend',
    },
    servers: [{ url: 'http://localhost:5000/api', description: 'Dev server' }],
    components: {
      securitySchemes: {
        AdminApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-admin-api-key',
          description: 'Required for PATCH and DELETE endpoints'
        }
      },
      schemas: {
        ReportInput: {
          type: 'object',
          required: ['location', 'description'],
          properties: {
            name: { type: 'string', example: 'Rahim' },
            contact: { type: 'string', example: '017xxxxxxxx' },
            location: { type: 'string', example: 'Sylhet Bondor Bazar' },
            description: { type: 'string', example: 'There is a fire near a shop and people are trapped.' },
            language: { type: 'string', enum: ['bn', 'en', 'unknown'], example: 'bn' }
          }
        },
        StatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['pending', 'in_review', 'assigned', 'resolved', 'rejected'], example: 'assigned' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);