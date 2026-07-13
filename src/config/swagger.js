const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CrisisDesk AI API',
      version: '1.0.0',
      description: 'AI-powered emergency and service request triage backend',
    },

    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? process.env.RENDER_EXTERNAL_URL + '/api'
          : 'http://localhost:5000/api',
        description: process.env.NODE_ENV === 'production'
          ? 'Production server'
          : 'Development server'
      }
    ],

    components: {   // ✅ ✅ ✅ IMPORTANT
      schemas: {
        ReportInput: {
          type: 'object',
          required: ['location', 'description'],
          properties: {
            name: { type: 'string', example: 'Rahim' },
            contact: { type: 'string', example: '017xxxxxxxx' },
            location: { type: 'string', example: 'Sylhet Bondor Bazar' },
            description: { type: 'string', example: 'There is a fire near a shop.' },
            language: { type: 'string', enum: ['bn', 'en', 'unknown'] }
          }
        }
      }
    }
  },

  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);