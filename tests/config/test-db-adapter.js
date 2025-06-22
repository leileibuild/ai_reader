/**
 * Test database adapter
 * 
 * This module provides a way to override the MongoDB connection
 * used by the controllers during testing, redirecting them to use
 * the MongoDB memory server instead of a real database.
 */

const mongoTestHelper = require('./mongodb-test-helper');
const { ObjectId } = require('mongodb');
const uuidv4 = require('uuid').v4;

// Store the original module.exports from db.js
let originalDbModule = null;

/**
 * Setup the database adapter for testing
 * This should be called before any tests that interact with the database
 */
async function setupTestDbAdapter() {
  // Start MongoDB memory server if not already started
  await mongoTestHelper.start();
  
  // Get the db module
  const dbModule = require('../../mongodb/db');
  
  // Store the original exports
  originalDbModule = { ...dbModule };
  
  // Create DB models with appropriate methods to match what controllers expect
  const createModels = (db) => {
    return {
      articles: {
        // Methods needed by controllers
        findById: async (id) => {
          return await db.collection('articles').findOne({ _id: id });
        },
        create: async (article) => {
          if (!article._id) {
            article._id = uuidv4();
          }
          article.createdAt = new Date();
          article.updatedAt = new Date();
          await db.collection('articles').insertOne(article);
          return article;
        },
        update: async (id, article) => {
          article.updatedAt = new Date();
          await db.collection('articles').updateOne({ _id: id }, { $set: article });
          return { ...article, _id: id };
        },
        delete: async (id) => {
          await db.collection('articles').deleteOne({ _id: id });
          return { _id: id };
        },
        search: async (query, options) => {
          const limit = options?.limit || 10;
          const page = options?.page || 1;
          const skip = (page - 1) * limit;
          
          let filter = {};
          if (query?.q) {
            filter = { 
              $or: [
                { title: { $regex: query.q, $options: 'i' } },
                { content: { $regex: query.q, $options: 'i' } }
              ] 
            };
          }
          
          const articles = await db.collection('articles')
            .find(filter)
            .skip(skip)
            .limit(limit)
            .toArray();
            
          const total = await db.collection('articles').countDocuments(filter);
          
          return {
            articles,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit)
            }
          };
        },
        findByTopic: async (topicId, options) => {
          const limit = options?.limit || 10;
          const page = options?.page || 1;
          const skip = (page - 1) * limit;
          
          const articles = await db.collection('articles')
            .find({ topics: topicId })
            .skip(skip)
            .limit(limit)
            .toArray();
            
          const total = await db.collection('articles').countDocuments({ topics: topicId });
          
          return {
            articles,
            pagination: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit)
            }
          };
        },
        findByIds: async (ids) => {
          return await db.collection('articles')
            .find({ _id: { $in: ids } })
            .toArray();
        },
        getAll: async (options = {}) => {
          const limit = options.limit || 10;
          const page = options.page || 1;
          const skip = (page - 1) * limit;
          
          const articles = await db.collection('articles')
            .find({})
            .skip(skip)
            .limit(limit)
            .toArray();
            
          const total = await db.collection('articles').countDocuments({});
          
          return {
            data: articles,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          };
        }
      },
      topics: {
        // Topics model methods
        findById: async (id) => {
          return await db.collection('topics').findOne({ _id: id });
        },
        create: async (topic) => {
          if (!topic._id) {
            topic._id = uuidv4();
          }
          topic.createdAt = new Date();
          topic.updatedAt = new Date();
          await db.collection('topics').insertOne(topic);
          return topic;
        },
        update: async (id, topic) => {
          topic.updatedAt = new Date();
          await db.collection('topics').updateOne({ _id: id }, { $set: topic });
          return { ...topic, _id: id };
        },
        delete: async (id) => {
          await db.collection('topics').deleteOne({ _id: id });
          return { _id: id };
        },
        findByIds: async (ids) => {
          return await db.collection('topics')
            .find({ _id: { $in: ids } })
            .toArray();
        },
        // Add methods needed by controllers
        findAll: async (query = {}) => {
          let filter = {};
          if (query.q) {
            filter = {
              $or: [
                { name: { $regex: query.q, $options: 'i' } },
                { description: { $regex: query.q, $options: 'i' } }
              ]
            };
          }
          
          return await db.collection('topics').find(filter).toArray();
        },
        getAll: async (query = {}) => {
          // Alias for findAll to handle both method names
          let filter = {};
          if (query.q) {
            filter = {
              $or: [
                { name: { $regex: query.q, $options: 'i' } },
                { description: { $regex: query.q, $options: 'i' } }
              ]
            };
          }
          
          return await db.collection('topics').find(filter).toArray();
        }
      },
      // Similar model patterns for other entity types
      categories: {
        findById: async (id) => {
          return await db.collection('categories').findOne({ _id: id });
        },
        create: async (category) => {
          if (!category._id) {
            category._id = uuidv4();
          }
          category.createdAt = new Date();
          category.updatedAt = new Date();
          await db.collection('categories').insertOne(category);
          return category;
        },
        update: async (id, category) => {
          category.updatedAt = new Date();
          await db.collection('categories').updateOne({ _id: id }, { $set: category });
          return { ...category, _id: id };
        },
        delete: async (id) => {
          await db.collection('categories').deleteOne({ _id: id });
          return { _id: id };
        },
        findByIds: async (ids) => {
          return await db.collection('categories')
            .find({ _id: { $in: ids } })
            .toArray();
        },
        // Add methods needed by controllers
        findAll: async (query = {}) => {
          let filter = {};
          if (query.q) {
            filter = {
              $or: [
                { name: { $regex: query.q, $options: 'i' } },
                { description: { $regex: query.q, $options: 'i' } }
              ]
            };
          }
          
          return await db.collection('categories').find(filter).toArray();
        },
        getAll: async (query = {}) => {
          // Alias for findAll to handle both method names
          let filter = {};
          if (query.q) {
            filter = {
              $or: [
                { name: { $regex: query.q, $options: 'i' } },
                { description: { $regex: query.q, $options: 'i' } }
              ]
            };
          }
          
          return await db.collection('categories').find(filter).toArray();
        }
      },
      events: {
        findById: async (id) => {
          return await db.collection('events').findOne({ _id: id });
        },
        create: async (event) => {
          if (!event._id) {
            event._id = uuidv4();
          }
          event.createdAt = new Date();
          event.updatedAt = new Date();
          await db.collection('events').insertOne(event);
          return event;
        },
        update: async (id, event) => {
          event.updatedAt = new Date();
          await db.collection('events').updateOne({ _id: id }, { $set: event });
          return { ...event, _id: id };
        },
        delete: async (id) => {
          await db.collection('events').deleteOne({ _id: id });
          return { _id: id };
        },
        findByIds: async (ids) => {
          return await db.collection('events')
            .find({ _id: { $in: ids } })
            .toArray();
        },
        // Add methods needed by controllers
        findAll: async (query = {}) => {
          let filter = {};
          if (query.q) {
            filter = {
              $or: [
                { name: { $regex: query.q, $options: 'i' } },
                { description: { $regex: query.q, $options: 'i' } }
              ]
            };
          }
          
          return await db.collection('events').find(filter).toArray();
        },
        getAll: async (query = {}) => {
          // Alias for findAll to handle both method names
          let filter = {};
          if (query.q) {
            filter = {
              $or: [
                { name: { $regex: query.q, $options: 'i' } },
                { description: { $regex: query.q, $options: 'i' } }
              ]
            };
          }
          
          return await db.collection('events').find(filter).toArray();
        }
      },
      notes: {
        findById: async (id) => {
          return await db.collection('notes').findOne({ _id: id });
        },
        create: async (note) => {
          if (!note._id) {
            note._id = uuidv4();
          }
          note.createdAt = new Date();
          note.updatedAt = new Date();
          await db.collection('notes').insertOne(note);
          return note;
        },
        update: async (id, note) => {
          note.updatedAt = new Date();
          await db.collection('notes').updateOne({ _id: id }, { $set: note });
          return { ...note, _id: id };
        },
        delete: async (id) => {
          await db.collection('notes').deleteOne({ _id: id });
          return { _id: id };
        },
        findByIds: async (ids) => {
          return await db.collection('notes')
            .find({ _id: { $in: ids } })
            .toArray();
        },
        // Add methods needed by controllers
        findAll: async (query = {}) => {
          let filter = {};
          if (query.q) {
            filter = {
              $or: [
                { name: { $regex: query.q, $options: 'i' } },
                { description: { $regex: query.q, $options: 'i' } }
              ]
            };
          }
          
          return await db.collection('notes').find(filter).toArray();
        },
        getAll: async (query = {}) => {
          // Alias for findAll to handle both method names
          let filter = {};
          if (query.q) {
            filter = {
              $or: [
                { name: { $regex: query.q, $options: 'i' } },
                { description: { $regex: query.q, $options: 'i' } }
              ]
            };
          }
          
          return await db.collection('notes').find(filter).toArray();
        }
      }
    };
  };

  // Mock the getModels method to return our test models
  dbModule.getModels = () => {
    const db = mongoTestHelper.getDb();
    const models = createModels(db);
    
    return { models };
  };
  
  // Override the getDb method
  dbModule.getDb = () => mongoTestHelper.getDb();
  
  // Get the MongoDB client module and mock it too for direct usage
  const mongodb = require('mongodb');
  const OriginalMongoClient = mongodb.MongoClient;
  
  // Override the MongoClient constructor to return our test client
  mongodb.MongoClient = function() {
    return {
      connect: async () => ({
        db: (dbName) => mongoTestHelper.getDb()
      }),
      db: (dbName) => mongoTestHelper.getDb()
    };
  };
  
  // Also add the connect method to the prototype
  mongodb.MongoClient.connect = async (uri) => ({
    db: (dbName) => mongoTestHelper.getDb()
  });
  
  return { dbModule, mongodb };
}

/**
 * Restore the original database modules
 * This should be called after tests are complete
 */
function restoreOriginalDbAdapter() {
  if (originalDbModule) {
    // Restore the original db module exports
    const dbModule = require('../../mongodb/db');
    Object.keys(originalDbModule).forEach(key => {
      dbModule[key] = originalDbModule[key];
    });
    originalDbModule = null;
  }
}

module.exports = {
  setupTestDbAdapter,
  restoreOriginalDbAdapter,
  // Keep for backward compatibility
  restoreOriginalMongoClient: restoreOriginalDbAdapter
};
