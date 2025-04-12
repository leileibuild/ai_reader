/**
 * Note model for MongoDB
 */
const { ObjectId } = require('mongodb');
const noteSchema = require('../schemas/note');

class Note {
  constructor(db) {
    this.collection = db.collection('notes');
  }

  /**
   * Initialize collection with schema validation
   */
  static async initialize(db) {
    try {
      await db.createCollection('notes', noteSchema);
      console.log('Notes collection initialized with validation schema');
      
      // Create indexes for better performance
      await db.collection('notes').createIndex({ reference_type: 1, reference_id: 1 });
      await db.collection('notes').createIndex({ created_at: -1 });
      await db.collection('notes').createIndex({ tags: 1 });
      
      return new Note(db);
    } catch (error) {
      // If collection already exists, just return the model
      if (error.code === 48) {
        console.log('Notes collection already exists');
        return new Note(db);
      }
      throw error;
    }
  }

  /**
   * Create a new note
   */
  async create(noteData) {
    // Generate ID if not provided
    if (!noteData.id) {
      noteData.id = new ObjectId().toString();
    }
    
    // Set timestamps
    const now = new Date();
    noteData.created_at = noteData.created_at || now;
    noteData.updated_at = noteData.updated_at || now;
    
    // Initialize arrays and objects if not present
    noteData.tags = noteData.tags || [];
    noteData.metadata = noteData.metadata || {};
    noteData.is_archived = noteData.is_archived || false;
    
    const result = await this.collection.insertOne(noteData);
    return result.insertedId ? noteData : null;
  }

  /**
   * Find note by ID
   */
  async findById(id) {
    return await this.collection.findOne({ id });
  }

  /**
   * Find notes by reference (entity type and ID)
   */
  async findByReference(referenceType, referenceId, limit = 20, skip = 0) {
    return await this.collection.find({ 
      reference_type: referenceType, 
      reference_id: referenceId,
      is_archived: false
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Find notes by tag
   */
  async findByTag(tag, limit = 20, skip = 0) {
    return await this.collection.find({ 
      tags: tag,
      is_archived: false
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Search notes by content
   */
  async search(keyword, limit = 20, skip = 0) {
    return await this.collection.find({
      content: { $regex: keyword, $options: 'i' },
      is_archived: false
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Update a note
   */
  async update(id, updateData) {
    // Set updated timestamp
    updateData.updated_at = new Date();
    
    const result = await this.collection.updateOne(
      { id },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Add tags to a note
   */
  async addTags(id, tags) {
    const result = await this.collection.updateOne(
      { id },
      { 
        $addToSet: { tags: { $each: tags } },
        $set: { updated_at: new Date() }
      }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Remove tags from a note
   */
  async removeTags(id, tags) {
    const result = await this.collection.updateOne(
      { id },
      { 
        $pull: { tags: { $in: tags } },
        $set: { updated_at: new Date() }
      }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Archive a note
   */
  async archive(id) {
    return await this.update(id, { is_archived: true });
  }

  /**
   * Unarchive a note
   */
  async unarchive(id) {
    return await this.update(id, { is_archived: false });
  }

  /**
   * Delete a note
   */
  async delete(id) {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  /**
   * Get recent notes
   */
  async getRecent(limit = 20) {
    return await this.collection.find({ is_archived: false })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Get notes by priority
   */
  async getByPriority(limit = 10) {
    return await this.collection.find({ is_archived: false })
      .sort({ priority: -1, created_at: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = Note;
