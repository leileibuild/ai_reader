const request = require('supertest');
const express = require('express');
const mongoTestHelper = require('./mongodb-test-helper');

/**
 * API testing helper using supertest
 * Provides utilities to set up an Express app with routes for testing
 */
class SupertestHelper {
  constructor() {
    this.app = null;
    this.request = null;
  }

  /**
   * Set up Express app for testing
   * @param {Function} setupRoutes - Function that sets up routes on the Express app
   */
  async setupApp(setupRoutes) {
    // Start MongoDB memory server if it's not already started
    await mongoTestHelper.start();
    
    // Create Express app
    const app = express();
    
    // Set up middleware and routes
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Apply provided route setup function
    if (typeof setupRoutes === 'function') {
      setupRoutes(app);
    }
    
    this.app = app;
    this.request = request(app);
    
    return this.request;
  }
  
  /**
   * Get supertest request object
   */
  getRequest() {
    if (!this.request) {
      throw new Error('App not initialized. Call setupApp() first.');
    }
    return this.request;
  }
  
  /**
   * Clean up resources
   */
  async cleanup() {
    // Clear database
    await mongoTestHelper.clearDatabase();
  }
  
  /**
   * Tear down resources
   */
  async tearDown() {
    // Stop MongoDB memory server
    await mongoTestHelper.stop();
    this.app = null;
    this.request = null;
  }
}

module.exports = new SupertestHelper();
