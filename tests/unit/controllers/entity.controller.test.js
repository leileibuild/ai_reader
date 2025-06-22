/**
 * Unit tests for Entity Controller
 * 
 * These tests focus on testing the controller functions directly,
 * mocking any dependencies (database, req/res objects) as needed.
 */
const entityController = require('../../../backend/controllers/entity.controller');
const entityFixtures = require('../../fixtures/entity-fixtures');
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
    insertMany: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
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

describe('Entity Controller Unit Tests', () => {
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
   * createOrUpdateEntities controller tests
   */
  describe('createOrUpdateEntities', () => {
    it('should create new entities successfully', async () => {
      // Mock request with new entities data
      req.body = entityFixtures.batchEntities;
      
      // Mock database response
      const mockTopicInsertResult = { 
        insertedIds: [uuidv4()],
        acknowledged: true
      };
      const mockCategoryInsertResult = { 
        insertedIds: [uuidv4()],
        acknowledged: true
      };
      
      // Mock created entities
      const mockCreatedTopics = [
        {
          _id: mockTopicInsertResult.insertedIds[0],
          ...entityFixtures.batchEntities.topics[0],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ];
      
      const mockCreatedCategories = [
        {
          _id: mockCategoryInsertResult.insertedIds[0],
          ...entityFixtures.batchEntities.categories[0],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        }
      ];
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      
      // Mock insertMany for different collections
      mockCollection.insertMany
        .mockResolvedValueOnce(mockTopicInsertResult)    // topics
        .mockResolvedValueOnce(mockCategoryInsertResult); // categories
      
      // Mock toArray for different collections
      mockCollection.toArray
        .mockResolvedValueOnce(mockCreatedTopics)       // topics
        .mockResolvedValueOnce(mockCreatedCategories);  // categories
      
      // Call controller function
      await entityController.createOrUpdateEntities(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('topics');
      expect(mockDb.collection).toHaveBeenCalledWith('categories');
      expect(mockCollection.insertMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        topics: expect.any(Array),
        categories: expect.any(Array)
      }));
    });
    
    it('should update existing entities if IDs are provided', async () => {
      // Create entity with ID for update
      const topicId = uuidv4();
      req.body = {
        topics: [{
          _id: topicId,
          name: "Updated Topic Name",
          description: "Updated description",
          color: "#ABCDEF"
        }]
      };
      
      // Mock database response
      const mockUpdateResult = {
        matchedCount: 1,
        modifiedCount: 1,
        acknowledged: true
      };
      
      const mockUpdatedTopic = {
        _id: topicId,
        ...req.body.topics[0],
        updatedAt: expect.any(Date)
      };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.updateOne.mockResolvedValue(mockUpdateResult);
      mockCollection.findOne.mockResolvedValue(mockUpdatedTopic);
      
      // Call controller function
      await entityController.createOrUpdateEntities(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('topics');
      expect(mockCollection.updateOne).toHaveBeenCalled();
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: topicId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        topics: expect.arrayContaining([
          expect.objectContaining({ _id: topicId, name: "Updated Topic Name" })
        ])
      }));
    });
    
    it('should handle validation errors', async () => {
      // Mock request with invalid entity data
      req.body = {
        topics: [{ invalidField: "Invalid topic without required name" }]
      };
      
      // Call controller function
      await entityController.createOrUpdateEntities(req, res, next);
      
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
   * getEntities controller tests
   */
  describe('getEntities', () => {
    it('should get entities by their IDs', async () => {
      // Mock request with entity IDs
      const topicId = entityFixtures.mockTopics[0]._id;
      const categoryId = entityFixtures.mockCategories[0]._id;
      req.query = {
        topicIds: topicId,
        categoryIds: categoryId
      };
      
      // Mock database responses
      const mockTopic = { ...entityFixtures.mockTopics[0] };
      const mockCategory = { ...entityFixtures.mockCategories[0] };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      
      // Mock toArray for different queries
      mockCollection.toArray
        .mockResolvedValueOnce([mockTopic])
        .mockResolvedValueOnce([mockCategory]);
      
      // Call controller function
      await entityController.getEntities(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('topics');
      expect(mockDb.collection).toHaveBeenCalledWith('categories');
      expect(mockCollection.find).toHaveBeenCalledWith(expect.objectContaining({
        _id: expect.objectContaining({ $in: [topicId] })
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        topics: [mockTopic],
        categories: [mockCategory]
      }));
    });
    
    it('should handle missing or invalid IDs gracefully', async () => {
      // Mock request with no IDs
      req.query = {};
      
      // Call controller function
      await entityController.getEntities(req, res, next);
      
      // Assertions
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        topics: [],
        categories: [],
        events: [],
        notes: []
      }));
    });
  });
  
  /**
   * deleteEntities controller tests
   */
  describe('deleteEntities', () => {
    it('should delete entities by their IDs', async () => {
      // Mock request with entity IDs to delete
      const topicId = entityFixtures.mockTopics[0]._id;
      const categoryId = entityFixtures.mockCategories[0]._id;
      req.body = {
        topicIds: [topicId],
        categoryIds: [categoryId]
      };
      
      // Mock database responses
      const mockTopicDeleteResult = {
        deletedCount: 1,
        acknowledged: true
      };
      
      const mockCategoryDeleteResult = {
        deletedCount: 1,
        acknowledged: true
      };
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      
      // Mock deleteMany for different collections
      mockCollection.deleteMany
        .mockResolvedValueOnce(mockTopicDeleteResult)
        .mockResolvedValueOnce(mockCategoryDeleteResult);
      
      // Call controller function
      await entityController.deleteEntities(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('topics');
      expect(mockDb.collection).toHaveBeenCalledWith('categories');
      expect(mockCollection.deleteMany).toHaveBeenCalledWith(expect.objectContaining({
        _id: expect.objectContaining({ $in: [topicId] })
      }));
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
    
    it('should handle empty delete request gracefully', async () => {
      // Mock request with no IDs to delete
      req.body = {};
      
      // Call controller function
      await entityController.deleteEntities(req, res, next);
      
      // Assertions
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
  });
  
  /**
   * getAllTopics controller tests
   */
  describe('getAllTopics', () => {
    it('should get all topics with optional filtering', async () => {
      // Mock request with filter parameters
      req.query = {
        search: 'test',
        sortBy: 'name',
        sortOrder: 'asc',
        page: '1',
        limit: '10'
      };
      
      // Mock database response
      const mockTopics = entityFixtures.mockTopics;
      const mockCount = mockTopics.length;
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      mockCollection.toArray.mockResolvedValue(mockTopics);
      mockCollection.countDocuments.mockResolvedValue(mockCount);
      
      // Call controller function
      await entityController.getAllTopics(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('topics');
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockCollection.sort).toHaveBeenCalledWith({ name: 1 }); // asc
      expect(res.json).toHaveBeenCalledWith({
        data: mockTopics,
        total: mockCount,
        page: 1,
        limit: 10,
        totalPages: expect.any(Number)
      });
    });
  });
  
  /**
   * searchEntities controller tests
   */
  describe('searchEntities', () => {
    it('should search across all specified entity types', async () => {
      // Mock request with search query
      req.query = {
        q: 'test',
        types: 'topics,categories'
      };
      
      // Mock database responses
      const mockTopics = entityFixtures.mockTopics;
      const mockCategories = entityFixtures.mockCategories;
      
      // Setup mocks
      const mockDb = require('mongodb').MongoClient().db();
      const mockCollection = mockDb.collection();
      
      // Mock toArray for different entity types
      mockCollection.toArray
        .mockResolvedValueOnce(mockTopics)
        .mockResolvedValueOnce(mockCategories);
      
      // Call controller function
      await entityController.searchEntities(req, res, next);
      
      // Assertions
      expect(mockDb.collection).toHaveBeenCalledWith('topics');
      expect(mockDb.collection).toHaveBeenCalledWith('categories');
      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({ 
          $or: expect.arrayContaining([
            { name: expect.objectContaining({ $regex: 'test', $options: 'i' }) },
            { description: expect.objectContaining({ $regex: 'test', $options: 'i' }) }
          ])
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        topics: mockTopics,
        categories: mockCategories,
        events: [],
        notes: []
      });
    });
    
    it('should handle missing search query gracefully', async () => {
      // Mock request with no search query
      req.query = { types: 'topics,categories' };
      
      // Call controller function
      await entityController.searchEntities(req, res, next);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: expect.stringContaining('search query') 
        })
      );
    });
  });
});
