/**
 * Unit tests for Article Controller
 * 
 * These tests focus on testing the controller functions directly,
 * mocking any dependencies (database, req/res objects) as needed.
 */
const articleController = require('../../../backend/controllers/article.controller');
const articleFixtures = require('../../fixtures/article-fixtures');
const { v4: uuidv4 } = require('uuid');

// Mock the MongoDB client and database
jest.mock('mongodb', () => {
  // Create a mock collection with all required methods
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn()
  };
  
  // Create a mock database with a collection method
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
  };
  
  // Create a mock MongoClient with db and connect methods
  const MongoClient = jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({}),
    db: jest.fn().mockReturnValue(mockDb)
  }));
  
  return { MongoClient };
});

describe('Article Controller Unit Tests', () => {
  // Mock req, res, next objects for controller functions
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Express request and response objects
    req = {
      params: {},
      query: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });
  
  /**
   * getAllArticles controller tests
   */
  describe('getAllArticles', () => {
    it('should get articles with default pagination', async () => {
      // Mock request with default pagination
      req.query = {};
      
      // Mock database response
      const mockArticles = articleFixtures.mockArticles;
      const mockCount = mockArticles.length;
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.toArray.mockResolvedValue(mockArticles);
      mockCollection.countDocuments.mockResolvedValue(mockCount);
      
      // Call controller function
      await articleController.getAllArticles(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('articles');
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockCollection.countDocuments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        data: mockArticles,
        total: mockCount,
        page: 1,
        limit: expect.any(Number),
        totalPages: expect.any(Number)
      });
    });
    
    it('should handle query parameters for filtering', async () => {
      // Mock request with query parameters
      req.query = {
        isPriority: 'true',
        page: '2',
        limit: '10'
      };
      
      // Mock database response
      const mockArticles = articleFixtures.mockArticles.filter(a => a.isPriority);
      const mockCount = mockArticles.length;
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.toArray.mockResolvedValue(mockArticles);
      mockCollection.countDocuments.mockResolvedValue(mockCount);
      
      // Call controller function
      await articleController.getAllArticles(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('articles');
      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({ isPriority: true })
      );
      expect(mockCollection.skip).toHaveBeenCalledWith(10); // (page-1) * limit
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should handle database errors', async () => {
      // Setup mock to throw error
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      const dbError = new Error('Database error');
      mockCollection.find.mockImplementation(() => {
        throw dbError;
      });
      
      // Call controller function
      await articleController.getAllArticles(req, res, next);
      
      // Assertions
      expect(next).toHaveBeenCalledWith(dbError);
    });
  });
  
  /**
   * getArticleById controller tests
   */
  describe('getArticleById', () => {
    it('should return article when found', async () => {
      // Mock request with article ID
      const articleId = articleFixtures.mockArticles[0]._id;
      req.params = { id: articleId };
      
      // Mock database response
      const mockArticle = { ...articleFixtures.mockArticles[0] };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.findOne.mockResolvedValue(mockArticle);
      
      // Call controller function
      await articleController.getArticleById(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('articles');
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: articleId })
      );
      expect(res.json).toHaveBeenCalledWith(mockArticle);
    });
    
    it('should return 404 when article not found', async () => {
      // Mock request with non-existent article ID
      req.params = { id: uuidv4() };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.findOne.mockResolvedValue(null);
      
      // Call controller function
      await articleController.getArticleById(req, res, next);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: expect.stringContaining('not found') 
        })
      );
    });
  });
  
  /**
   * createArticle controller tests
   */
  describe('createArticle', () => {
    it('should create an article successfully', async () => {
      // Mock request with article data
      req.body = articleFixtures.newArticle;
      
      // Mock database response
      const mockInsertResult = { 
        insertedId: uuidv4(),
        acknowledged: true
      };
      const mockCreatedArticle = {
        _id: mockInsertResult.insertedId,
        ...req.body,
        isRead: false,
        isPriority: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.insertOne.mockResolvedValue(mockInsertResult);
      mockCollection.findOne.mockResolvedValue(mockCreatedArticle);
      
      // Call controller function
      await articleController.createArticle(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('articles');
      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: mockInsertResult.insertedId });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedArticle);
    });
    
    it('should handle validation errors', async () => {
      // Mock request with invalid article data (missing title)
      req.body = {
        content: "Content without a title",
        summary: "Summary without a title"
      };
      
      // Call controller function
      await articleController.createArticle(req, res, next);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: expect.stringContaining('validation') 
        })
      );
    });
  });
  
  /**
   * updateArticle controller tests
   */
  describe('updateArticle', () => {
    it('should update an article successfully', async () => {
      // Mock request with article ID and update data
      const articleId = articleFixtures.mockArticles[0]._id;
      req.params = { id: articleId };
      req.body = articleFixtures.updatedArticle;
      
      // Mock database response
      const mockUpdateResult = {
        matchedCount: 1,
        modifiedCount: 1,
        acknowledged: true
      };
      const mockUpdatedArticle = {
        ...articleFixtures.mockArticles[0],
        ...req.body,
        updatedAt: expect.any(Date)
      };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.updateOne.mockResolvedValue(mockUpdateResult);
      mockCollection.findOne.mockResolvedValue(mockUpdatedArticle);
      
      // Call controller function
      await articleController.updateArticle(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('articles');
      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: articleId });
      expect(res.json).toHaveBeenCalledWith(mockUpdatedArticle);
    });
    
    it('should return 404 when article not found for update', async () => {
      // Mock request with non-existent article ID
      req.params = { id: uuidv4() };
      req.body = articleFixtures.updatedArticle;
      
      // Mock database response
      const mockUpdateResult = {
        matchedCount: 0,
        modifiedCount: 0,
        acknowledged: true
      };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.updateOne.mockResolvedValue(mockUpdateResult);
      
      // Call controller function
      await articleController.updateArticle(req, res, next);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: expect.stringContaining('not found') 
        })
      );
    });
  });
  
  /**
   * deleteArticle controller tests
   */
  describe('deleteArticle', () => {
    it('should delete an article successfully', async () => {
      // Mock request with article ID
      const articleId = articleFixtures.mockArticles[0]._id;
      req.params = { id: articleId };
      
      // Mock database response
      const mockDeleteResult = {
        deletedCount: 1,
        acknowledged: true
      };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.deleteOne.mockResolvedValue(mockDeleteResult);
      
      // Call controller function
      await articleController.deleteArticle(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('articles');
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: articleId });
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
    
    it('should return 404 when article not found for deletion', async () => {
      // Mock request with non-existent article ID
      req.params = { id: uuidv4() };
      
      // Mock database response
      const mockDeleteResult = {
        deletedCount: 0,
        acknowledged: true
      };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.deleteOne.mockResolvedValue(mockDeleteResult);
      
      // Call controller function
      await articleController.deleteArticle(req, res, next);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: expect.stringContaining('not found') 
        })
      );
    });
  });
  
  /**
   * searchArticles controller tests
   */
  describe('searchArticles', () => {
    it('should search articles by keyword', async () => {
      // Mock request with search query
      req.query = { q: 'test' };
      
      // Mock database response
      const mockArticles = articleFixtures.mockArticles;
      const mockCount = mockArticles.length;
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.toArray.mockResolvedValue(mockArticles);
      mockCollection.countDocuments.mockResolvedValue(mockCount);
      
      // Call controller function
      await articleController.searchArticles(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('articles');
      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({ 
          $or: expect.arrayContaining([
            { title: expect.objectContaining({ $regex: 'test', $options: 'i' }) },
            { content: expect.objectContaining({ $regex: 'test', $options: 'i' }) },
            { summary: expect.objectContaining({ $regex: 'test', $options: 'i' }) }
          ])
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        data: mockArticles,
        total: mockCount,
        page: expect.any(Number),
        limit: expect.any(Number),
        totalPages: expect.any(Number)
      });
    });
  });
});
