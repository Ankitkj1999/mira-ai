const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const chatRoutes = require('./routes/chat');
const propertyRoutes = require('./routes/properties');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 7070;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/health', healthRoutes);

// Swagger Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customOptions: {
      displayRequestDuration: true,
    },
  })
);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
