/**
 * Main server entry point for the News Reader backend service
 * 
 * This file initializes the Express application, connects to MongoDB,
 * configures middleware, and registers API routes.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const db = require('./mongodb/db');

// Import routes
const articleRoutes = require('./backend/routes/article.routes');
const entityRoutes = require('./backend/routes/entity.routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(morgan('dev')); // Request logging
app.use(express.json({ limit: '10mb' })); // Parse JSON requests with size limit
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests

// Serve static files from 'public' directory
app.use(express.static('public'));

// API routes
app.use('/api/articles', articleRoutes);
app.use('/api/entities', entityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await db.connect();
    
    // Start listening for requests - bind to all interfaces for Docker/external access
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log(`Health check available at http://0.0.0.0:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await db.close();
    console.log('Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();
