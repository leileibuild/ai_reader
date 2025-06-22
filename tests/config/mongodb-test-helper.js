const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

/**
 * MongoDB test helper utility
 * Provides methods to start, get connection to, and stop in-memory MongoDB server
 */
class MongoDBTestHelper {
  constructor() {
    this.mongoServer = null;
    this.client = null;
    this.db = null;
    this.uri = null;
  }

  /**
   * Start MongoDB memory server
   */
  async start() {
    this.mongoServer = await MongoMemoryServer.create();
    this.uri = this.mongoServer.getUri();
    
    // Connect to the in-memory database
    this.client = new MongoClient(this.uri);
    await this.client.connect();
    
    // Default database name
    this.db = this.client.db('news_reader_test');
    
    return {
      uri: this.uri,
      client: this.client,
      db: this.db
    };
  }
  
  /**
   * Get database connection
   */
  getDb() {
    if (!this.db) {
      throw new Error('Database not initialized. Call start() first.');
    }
    return this.db;
  }
  
  /**
   * Get database connection URI
   */
  getUri() {
    if (!this.uri) {
      throw new Error('MongoDB memory server not initialized. Call start() first.');
    }
    return this.uri;
  }
  
  /**
   * Clear all collections in the database
   */
  async clearDatabase() {
    if (!this.db) {
      throw new Error('Database not initialized. Call start() first.');
    }
    
    const collections = await this.db.listCollections().toArray();
    
    for (const collection of collections) {
      await this.db.collection(collection.name).deleteMany({});
    }
  }
  
  /**
   * Stop MongoDB memory server and close connections
   */
  async stop() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    
    if (this.mongoServer) {
      await this.mongoServer.stop();
      this.mongoServer = null;
    }
    
    this.db = null;
    this.uri = null;
  }
}

module.exports = new MongoDBTestHelper();
