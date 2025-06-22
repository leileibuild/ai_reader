/**
 * Article controller for handling CRUD operations on article entities
 * 
 * This module implements the business logic for creating, reading, updating, and deleting
 * article documents in the MongoDB database.
 */
const { v4: uuidv4 } = require('uuid');
const db = require('../../mongodb/db');
const { validateArticle } = require('../utils/validators');

/**
 * Get all articles with pagination, filtering, and sorting
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAllArticles(req, res, next) {
  try {
    // Extract query parameters for pagination, filtering, and sorting
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    const sort = req.query.sort || 'published_date';
    const order = req.query.order === 'asc' ? 1 : -1;
    
    // Get database models
    const models = db.getModels();
    
    // Create a query to find articles based on filters
    let query = {};
    
    // Apply filters if provided
    if (req.query.publisher) {
      query.publisher = req.query.publisher;
    }
    
    if (req.query.author) {
      query.author = req.query.author;
    }
    
    if (req.query.fromDate || req.query.toDate) {
      query.published_date = {};
      
      if (req.query.fromDate) {
        query.published_date.$gte = new Date(req.query.fromDate);
      }
      
      if (req.query.toDate) {
        query.published_date.$lte = new Date(req.query.toDate);
      }
    }
    
    // Get articles from database
    const articles = await models.articles.collection
      .find(query)
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get total count for pagination
    const total = await models.articles.collection.countDocuments(query);
    
    // Return articles with pagination metadata
    res.status(200).json({
      articles,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Get a single article by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getArticleById(req, res, next) {
  try {
    const { id } = req.params;
    
    // Get database models
    const { models } = db.getModels();
    
    // Find article by ID
    const article = await models.articles.findById(id);
    
    if (!article) {
      return res.status(404).json({ 
        error: { message: `Article with ID ${id} not found` } 
      });
    }
    
    res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Create a new article
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createArticle(req, res, next) {
  try {
    // Validate article data
    const { error, value } = validateArticle(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: { message: 'Invalid article data', details: error.details } 
      });
    }
    
    // Generate ID if not provided
    const articleData = { ...value };
    if (!articleData.id) {
      articleData.id = uuidv4();
    }
    
    // Set default values
    articleData.published_date = articleData.published_date || new Date();
    articleData.unread_count = articleData.unread_count || 1;
    articleData.priority = articleData.priority || 0;
    
    // Get database models
    const { models } = db.getModels();
    
    // Create article
    const createdArticle = await models.articles.create(articleData);
    
    res.status(201).json(createdArticle);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Update an existing article
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updateArticle(req, res, next) {
  try {
    const { id } = req.params;
    
    // Get database models
    const { models } = db.getModels();
    
    // Check if article exists
    const existingArticle = await models.articles.findById(id);
    
    if (!existingArticle) {
      return res.status(404).json({ 
        error: { message: `Article with ID ${id} not found` } 
      });
    }
    
    // Validate update data (partial validation)
    const { error, value } = validateArticle(req.body, true);
    
    if (error) {
      return res.status(400).json({ 
        error: { message: 'Invalid article data', details: error.details } 
      });
    }
    
    // Update article
    const updated = await models.articles.update(id, value);
    
    if (!updated) {
      return res.status(500).json({ 
        error: { message: 'Failed to update article' } 
      });
    }
    
    // Get updated article
    const updatedArticle = await models.articles.findById(id);
    
    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Delete an article
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function deleteArticle(req, res, next) {
  try {
    const { id } = req.params;
    
    // Get database models
    const { models } = db.getModels();
    
    // Check if article exists
    const existingArticle = await models.articles.findById(id);
    
    if (!existingArticle) {
      return res.status(404).json({ 
        error: { message: `Article with ID ${id} not found` } 
      });
    }
    
    // Delete article
    const deleted = await models.articles.delete(id);
    
    if (!deleted) {
      return res.status(500).json({ 
        error: { message: 'Failed to delete article' } 
      });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Search articles by keyword
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function searchArticles(req, res, next) {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        error: { message: 'Search query is required' } 
      });
    }
    
    // Extract pagination parameters
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    
    // Get database models
    const { models } = db.getModels();
    
    // Search articles
    const articles = await models.articles.search(q, limit, skip);
    
    res.status(200).json({
      articles,
      query: q,
      count: articles.length,
      pagination: {
        limit,
        skip
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Get articles by topic ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getArticlesByTopic(req, res, next) {
  try {
    const { topicId } = req.params;
    
    // Extract pagination parameters
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    
    // Get database models
    const { models } = db.getModels();
    
    // Get articles by topic
    const articles = await models.articles.findByTopic(topicId, limit, skip);
    
    res.status(200).json({
      articles,
      topicId,
      count: articles.length,
      pagination: {
        limit,
        skip
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Get articles by category ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getArticlesByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;
    
    // Extract pagination parameters
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    
    // Get database models
    const { models } = db.getModels();
    
    // Get articles by category
    const articles = await models.articles.findByCategory(categoryId, limit, skip);
    
    res.status(200).json({
      articles,
      categoryId,
      count: articles.length,
      pagination: {
        limit,
        skip
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Get articles by event ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getArticlesByEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    
    // Extract pagination parameters
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    
    // Get database models
    const { models } = db.getModels();
    
    // Get articles by event
    const articles = await models.articles.findByEvent(eventId, limit, skip);
    
    res.status(200).json({
      articles,
      eventId,
      count: articles.length,
      pagination: {
        limit,
        skip
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Get priority articles
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getPriorityArticles(req, res, next) {
  try {
    // Extract limit parameter
    const limit = parseInt(req.query.limit) || 10;
    
    // Get database models
    const { models } = db.getModels();
    
    // Get priority articles
    const articles = await models.articles.getPriorityArticles(limit);
    
    res.status(200).json({
      articles,
      count: articles.length
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

/**
 * Get unread articles
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getUnreadArticles(req, res, next) {
  try {
    // Extract limit parameter
    const limit = parseInt(req.query.limit) || 20;
    
    // Get database models
    const { models } = db.getModels();
    
    // Get unread articles
    const articles = await models.articles.getUnreadArticles(limit);
    
    res.status(200).json({
      articles,
      count: articles.length
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to retrieve articles',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
}

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  searchArticles,
  getArticlesByTopic,
  getArticlesByCategory,
  getArticlesByEvent,
  getPriorityArticles,
  getUnreadArticles
};
