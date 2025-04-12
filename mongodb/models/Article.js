/**
 * Article model for MongoDB
 */
const { MongoClient, ObjectId } = require('mongodb');
const articleSchema = require('../schemas/article');

class Article {
  constructor(db) {
    this.collection = db.collection('articles');
  }

  /**
   * Initialize collection with schema validation
   */
  static async initialize(db) {
    try {
      await db.createCollection('articles', articleSchema);
      console.log('Articles collection initialized with validation schema');
      
      // Create indexes for better performance
      await db.collection('articles').createIndex({ title: 1 });
      await db.collection('articles').createIndex({ published_date: -1 });
      await db.collection('articles').createIndex({ topics_ids: 1 });
      await db.collection('articles').createIndex({ categories_ids: 1 });
      
      return new Article(db);
    } catch (error) {
      // If collection already exists, just return the model
      if (error.code === 48) {
        console.log('Articles collection already exists');
        return new Article(db);
      }
      throw error;
    }
  }

  /**
   * Create a new article
   */
  async create(articleData) {
    // Generate ID if not provided
    if (!articleData.id) {
      articleData.id = new ObjectId().toString();
    }
    
    const result = await this.collection.insertOne(articleData);
    return result.insertedId ? articleData : null;
  }

  /**
   * Find article by ID
   */
  async findById(id) {
    return await this.collection.findOne({ id });
  }

  /**
   * Find articles by topic ID
   */
  async findByTopic(topicId, limit = 20, skip = 0) {
    return await this.collection.find({ topics_ids: topicId })
      .sort({ published_date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Find articles by category ID
   */
  async findByCategory(categoryId, limit = 20, skip = 0) {
    return await this.collection.find({ categories_ids: categoryId })
      .sort({ published_date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Find articles by event ID
   */
  async findByEvent(eventId, limit = 20, skip = 0) {
    return await this.collection.find({ events_ids: eventId })
      .sort({ published_date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Update an article
   */
  async update(id, updateData) {
    const result = await this.collection.updateOne(
      { id },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Delete an article
   */
  async delete(id) {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  /**
   * Search articles by keyword
   */
  async search(keyword, limit = 20, skip = 0) {
    return await this.collection.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } },
        { keywords: keyword }
      ]
    })
      .sort({ published_date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Get articles with high priority
   */
  async getPriorityArticles(limit = 10) {
    return await this.collection.find()
      .sort({ priority: -1, published_date: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Get unread articles
   */
  async getUnreadArticles(limit = 20) {
    return await this.collection.find({ unread_count: { $gt: 0 } })
      .sort({ priority: -1, published_date: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = Article;
