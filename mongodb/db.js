/**
 * MongoDB database connection and initialization
 * 
 * This module handles connecting to MongoDB and initializing collections with their schemas.
 * It provides a clean API for accessing the database models throughout the application.
 */
const { MongoClient } = require('mongodb');
const Article = require('./models/Article');
const Topic = require('./models/Topic');
const Category = require('./models/Category');
const Event = require('./models/Event');
const Note = require('./models/Note');

// Default connection URL - explicitly using 127.0.0.1 (localhost) for security
const DEFAULT_URL = 'mongodb://127.0.0.1:27017';
const DEFAULT_DB_NAME = 'news_reader';

// Database singleton
let _db = null;
let _models = null;

/**
 * Connect to MongoDB and initialize collections
 * 
 * @param {string} url - MongoDB connection URL
 * @param {string} dbName - Database name
 * @returns {Object} Object containing database and model instances
 */
async function connect(url = DEFAULT_URL, dbName = DEFAULT_DB_NAME) {
  if (_db) {
    return { db: _db, models: _models };
  }

  try {
    console.log(`Connecting to MongoDB at ${url}/${dbName}...`);
    
    // Connect to MongoDB
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get database reference
    _db = client.db(dbName);
    
    // Initialize models with schema validation
    _models = {
      articles: await Article.initialize(_db),
      topics: await Topic.initialize(_db),
      categories: await Category.initialize(_db),
      events: await Event.initialize(_db),
      notes: await Note.initialize(_db)
    };
    
    console.log('All collections initialized with schema validation');
    
    return { db: _db, models: _models };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Get the database instance
 * 
 * @returns {Object} MongoDB database instance
 */
function getDb() {
  if (!_db) {
    throw new Error('Database not initialized. Call connect() first.');
  }
  return _db;
}

/**
 * Get the models
 * 
 * @returns {Object} Object containing all model instances
 */
function getModels() {
  if (!_models) {
    throw new Error('Models not initialized. Call connect() first.');
  }
  return _models;
}

/**
 * Close the database connection
 */
async function close() {
  if (_db) {
    const client = _db.client;
    await client.close();
    console.log('MongoDB connection closed');
    _db = null;
    _models = null;
  }
}

module.exports = {
  connect,
  getDb,
  getModels,
  close
};
