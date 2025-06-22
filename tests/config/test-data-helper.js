/**
 * Test data helper utility
 * 
 * Provides methods to seed and clear test data in the MongoDB memory server
 */
const mongoTestHelper = require('./mongodb-test-helper');
const articleFixtures = require('../fixtures/article-fixtures');
const entityFixtures = require('../fixtures/entity-fixtures');

/**
 * Helper class for managing test data
 */
class TestDataHelper {
  /**
   * Seed the database with initial test data
   * @returns {Promise<Object>} Collections object with references to all seeded collections
   */
  async seedDatabase() {
    const db = mongoTestHelper.getDb();
    
    // Create collections
    const articlesCollection = db.collection('articles');
    const topicsCollection = db.collection('topics');
    const categoriesCollection = db.collection('categories');
    const eventsCollection = db.collection('events');
    const notesCollection = db.collection('notes');
    
    // Clear existing data
    await Promise.all([
      articlesCollection.deleteMany({}),
      topicsCollection.deleteMany({}),
      categoriesCollection.deleteMany({}),
      eventsCollection.deleteMany({}),
      notesCollection.deleteMany({})
    ]);
    
    // Insert test data
    await Promise.all([
      articlesCollection.insertMany(articleFixtures.mockArticles),
      topicsCollection.insertMany(entityFixtures.mockTopics),
      categoriesCollection.insertMany(entityFixtures.mockCategories),
      eventsCollection.insertMany(entityFixtures.mockEvents),
      notesCollection.insertMany(entityFixtures.mockNotes)
    ]);
    
    return {
      articles: articlesCollection,
      topics: topicsCollection,
      categories: categoriesCollection,
      events: eventsCollection,
      notes: notesCollection
    };
  }
  
  /**
   * Clear all test data from the database
   */
  async clearDatabase() {
    await mongoTestHelper.clearDatabase();
  }
  
  /**
   * Get a specific article by index from the fixture data
   * @param {number} index Index of the article in the fixtures array
   * @returns {Object} Article object
   */
  getArticle(index = 0) {
    return articleFixtures.mockArticles[index];
  }
  
  /**
   * Get a specific topic by index from the fixture data
   * @param {number} index Index of the topic in the fixtures array
   * @returns {Object} Topic object
   */
  getTopic(index = 0) {
    return entityFixtures.mockTopics[index];
  }
  
  /**
   * Get a specific category by index from the fixture data
   * @param {number} index Index of the category in the fixtures array
   * @returns {Object} Category object
   */
  getCategory(index = 0) {
    return entityFixtures.mockCategories[index];
  }
  
  /**
   * Get a specific event by index from the fixture data
   * @param {number} index Index of the event in the fixtures array
   * @returns {Object} Event object
   */
  getEvent(index = 0) {
    return entityFixtures.mockEvents[index];
  }
  
  /**
   * Get a specific note by index from the fixture data
   * @param {number} index Index of the note in the fixtures array
   * @returns {Object} Note object
   */
  getNote(index = 0) {
    return entityFixtures.mockNotes[index];
  }
  
  /**
   * Get new article data for test creation
   * @returns {Object} New article data
   */
  getNewArticle() {
    return { ...articleFixtures.newArticle };
  }
  
  /**
   * Get new topic data for test creation
   * @returns {Object} New topic data
   */
  getNewTopic() {
    return { ...entityFixtures.newTopic };
  }
}

module.exports = new TestDataHelper();
