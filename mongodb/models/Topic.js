/**
 * Topic model for MongoDB
 */
const { ObjectId } = require('mongodb');
const topicSchema = require('../schemas/topic');

class Topic {
  constructor(db) {
    this.collection = db.collection('topics');
  }

  /**
   * Initialize collection with schema validation
   */
  static async initialize(db) {
    try {
      await db.createCollection('topics', topicSchema);
      console.log('Topics collection initialized with validation schema');
      
      // Create indexes for better performance
      await db.collection('topics').createIndex({ name: 1 });
      await db.collection('topics').createIndex({ keywords: 1 });
      
      return new Topic(db);
    } catch (error) {
      // If collection already exists, just return the model
      if (error.code === 48) {
        console.log('Topics collection already exists');
        return new Topic(db);
      }
      throw error;
    }
  }

  /**
   * Create a new topic
   */
  async create(topicData) {
    // Generate ID if not provided
    if (!topicData.id) {
      topicData.id = new ObjectId().toString();
    }
    
    const result = await this.collection.insertOne(topicData);
    return result.insertedId ? topicData : null;
  }

  /**
   * Find topic by ID
   */
  async findById(id) {
    return await this.collection.findOne({ id });
  }

  /**
   * Find topics by category ID
   */
  async findByCategory(categoryId, limit = 20, skip = 0) {
    return await this.collection.find({ categories_ids: categoryId })
      .sort({ priority: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Find related topics
   */
  async findRelated(topicId, limit = 10) {
    const topic = await this.findById(topicId);
    if (!topic || !topic.related_topics_ids || topic.related_topics_ids.length === 0) {
      return [];
    }
    
    return await this.collection.find({ 
      id: { $in: topic.related_topics_ids } 
    })
      .limit(limit)
      .toArray();
  }

  /**
   * Update a topic
   */
  async update(id, updateData) {
    const result = await this.collection.updateOne(
      { id },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Add article to topic
   */
  async addArticle(topicId, articleId) {
    const result = await this.collection.updateOne(
      { id: topicId },
      { $addToSet: { articles_ids: articleId } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Add event to topic timeline
   */
  async addEventToTimeline(topicId, eventId) {
    const result = await this.collection.updateOne(
      { id: topicId },
      { 
        $addToSet: { 
          "timeline.events": eventId 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Delete a topic
   */
  async delete(id) {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  /**
   * Search topics by keyword
   */
  async search(keyword, limit = 20, skip = 0) {
    return await this.collection.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { keywords: keyword }
      ]
    })
      .sort({ priority: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Get priority topics
   */
  async getPriorityTopics(limit = 10) {
    return await this.collection.find()
      .sort({ priority: -1 })
      .limit(limit)
      .toArray();
  }
  
  /**
   * Get all topics (used by entity controller)
   */
  async getAll(limit = 50, skip = 0) {
    return await this.collection.find()
      .sort({ priority: -1, name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Get topics with unread articles
   */
  async getUnreadTopics(limit = 20) {
    return await this.collection.find({ unread_count: { $gt: 0 } })
      .sort({ priority: -1, unread_count: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = Topic;
