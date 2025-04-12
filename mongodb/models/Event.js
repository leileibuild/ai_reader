/**
 * Event model for MongoDB
 */
const { ObjectId } = require('mongodb');
const eventSchema = require('../schemas/event');

class Event {
  constructor(db) {
    this.collection = db.collection('events');
  }

  /**
   * Initialize collection with schema validation
   */
  static async initialize(db) {
    try {
      await db.createCollection('events', eventSchema);
      console.log('Events collection initialized with validation schema');
      
      // Create indexes for better performance
      await db.collection('events').createIndex({ date: -1 });
      await db.collection('events').createIndex({ articles_ids: 1 });
      
      return new Event(db);
    } catch (error) {
      // If collection already exists, just return the model
      if (error.code === 48) {
        console.log('Events collection already exists');
        return new Event(db);
      }
      throw error;
    }
  }

  /**
   * Create a new event
   */
  async create(eventData) {
    // Generate ID if not provided
    if (!eventData.id) {
      eventData.id = new ObjectId().toString();
    }
    
    // Initialize timeline if not present
    if (!eventData.timeline) {
      eventData.timeline = { events: [] };
    }
    
    const result = await this.collection.insertOne(eventData);
    return result.insertedId ? eventData : null;
  }

  /**
   * Find event by ID
   */
  async findById(id) {
    return await this.collection.findOne({ id });
  }

  /**
   * Find events by article ID
   */
  async findByArticle(articleId, limit = 10) {
    return await this.collection.find({ articles_ids: articleId })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Find related events
   */
  async findRelated(eventId, limit = 10) {
    const event = await this.findById(eventId);
    if (!event || !event.related_events_ids || event.related_events_ids.length === 0) {
      return [];
    }
    
    return await this.collection.find({ 
      id: { $in: event.related_events_ids } 
    })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Add article to event
   */
  async addArticle(eventId, articleId) {
    const result = await this.collection.updateOne(
      { id: eventId },
      { $addToSet: { articles_ids: articleId } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Add sub-event to timeline
   */
  async addToTimeline(eventId, subEvent) {
    // If subEvent is an ID, convert to object form
    let timelineEvent = typeof subEvent === 'string' ? 
      { date: new Date(), description: '', event_id: subEvent } : subEvent;
    
    // Ensure date is a Date object
    if (typeof timelineEvent.date === 'string') {
      timelineEvent.date = new Date(timelineEvent.date);
    }
    
    const result = await this.collection.updateOne(
      { id: eventId },
      { $push: { "timeline.events": timelineEvent } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Link related event
   */
  async linkRelatedEvent(eventId, relatedEventId) {
    const result = await this.collection.updateOne(
      { id: eventId },
      { $addToSet: { related_events_ids: relatedEventId } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Update an event
   */
  async update(id, updateData) {
    const result = await this.collection.updateOne(
      { id },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Delete an event
   */
  async delete(id) {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  /**
   * Search events by keyword
   */
  async search(keyword, limit = 20, skip = 0) {
    return await this.collection.find({
      description: { $regex: keyword, $options: 'i' }
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Get recent events
   */
  async getRecent(limit = 20) {
    return await this.collection.find()
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Get priority events
   */
  async getPriorityEvents(limit = 10) {
    return await this.collection.find()
      .sort({ priority: -1, date: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Get events with unread articles
   */
  async getUnreadEvents(limit = 20) {
    return await this.collection.find({ unread_count: { $gt: 0 } })
      .sort({ priority: -1, unread_count: -1, date: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = Event;
