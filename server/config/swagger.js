const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mira AI - Real Estate Chatbot API',
      version: '1.0.0',
      description: 'AI-powered real estate chatbot using RAG (Retrieval Augmented Generation)',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 7070}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Property: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            title: { type: 'string', example: '3 BHK Apartment in Downtown' },
            price: { type: 'number', example: 450000 },
            location: { type: 'string', example: 'New York, NY' },
            bedrooms: { type: 'number', example: 3 },
            bathrooms: { type: 'number', example: 2 },
            size_sqft: { type: 'number', example: 1500 },
            property_type: { 
              type: 'string', 
              example: 'Apartment',
              enum: ['Apartment', 'Condo', 'Villa', 'House', 'Penthouse', 'Studio', 'Townhouse', 'Duplex', 'Loft', 'Bungalow', 'Brownstone', 'Chalet', 'Estate', 'Cabin', 'Mansion', 'Other']
            },
            amenities: { type: 'array', items: { type: 'string' } },
            image_url: { type: 'string' },
            description: { type: 'string' },
          },
        },
        ChatMessage: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', example: 'Show me affordable homes near the beach' },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            response: { type: 'string', example: 'I found 3 properties that match your criteria...' },
            properties: { type: 'array', items: { $ref: '#/components/schemas/Property' } },
          },
        },
      },
    },
  },
  apis: ['./server/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
