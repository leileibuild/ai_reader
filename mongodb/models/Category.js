/**
 * Category model for MongoDB
 */
const { ObjectId } = require('mongodb');
const categorySchema = require('../schemas/category');

class Category {
  constructor(db) {
    this.collection = db.collection('categories');
  }

  /**
   * Initialize collection with schema validation
   */
  static async initialize(db) {
    try {
      await db.createCollection('categories', categorySchema);
      console.log('Categories collection initialized with validation schema');
      
      // Create indexes for better performance
      await db.collection('categories').createIndex({ name: 1 });
      await db.collection('categories').createIndex({ "subcategories.name": 1 });
      
      return new Category(db);
    } catch (error) {
      // If collection already exists, just return the model
      if (error.code === 48) {
        console.log('Categories collection already exists');
        return new Category(db);
      }
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async create(categoryData) {
    // Generate ID if not provided
    if (!categoryData.id) {
      categoryData.id = new ObjectId().toString();
    }
    
    // Initialize subcategories if not present
    if (!categoryData.subcategories) {
      categoryData.subcategories = [];
    }
    
    const result = await this.collection.insertOne(categoryData);
    return result.insertedId ? categoryData : null;
  }

  /**
   * Find category by ID
   */
  async findById(id) {
    return await this.collection.findOne({ id });
  }

  /**
   * Find all categories
   */
  async findAll(limit = 50, skip = 0) {
    return await this.collection.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
  
  /**
   * Get all categories (alias for findAll, used by entity controller)
   */
  async getAll(limit = 50, skip = 0) {
    return this.findAll(limit, skip);
  }

  /**
   * Add a subcategory to a category
   */
  async addSubcategory(categoryId, subcategory) {
    // Generate ID for subcategory if not provided
    if (!subcategory.id) {
      subcategory.id = new ObjectId().toString();
    }
    
    const result = await this.collection.updateOne(
      { id: categoryId },
      { $push: { subcategories: subcategory } }
    );
    return result.modifiedCount > 0 ? subcategory : null;
  }

  /**
   * Find subcategory by ID within a category
   */
  async findSubcategory(categoryId, subcategoryId) {
    const category = await this.findById(categoryId);
    if (!category || !category.subcategories) {
      return null;
    }
    
    return category.subcategories.find(sub => sub.id === subcategoryId) || null;
  }

  /**
   * Update a subcategory
   */
  async updateSubcategory(categoryId, subcategoryId, updateData) {
    const result = await this.collection.updateOne(
      { id: categoryId, "subcategories.id": subcategoryId },
      { 
        $set: Object.entries(updateData).reduce((acc, [key, value]) => {
          acc[`subcategories.$.${key}`] = value;
          return acc;
        }, {})
      }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Remove a subcategory
   */
  async removeSubcategory(categoryId, subcategoryId) {
    const result = await this.collection.updateOne(
      { id: categoryId },
      { $pull: { subcategories: { id: subcategoryId } } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Add topic to category
   */
  async addTopic(categoryId, topicId) {
    const result = await this.collection.updateOne(
      { id: categoryId },
      { $addToSet: { topics_ids: topicId } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Update a category
   */
  async update(id, updateData) {
    const result = await this.collection.updateOne(
      { id },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Delete a category
   */
  async delete(id) {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  /**
   * Search categories by keyword
   */
  async search(keyword, limit = 20, skip = 0) {
    return await this.collection.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { keywords: keyword },
        { "subcategories.name": { $regex: keyword, $options: 'i' } }
      ]
    })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Get categories with unread articles
   */
  async getUnreadCategories(limit = 20) {
    return await this.collection.find({ unread_count: { $gt: 0 } })
      .sort({ priority: -1, unread_count: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = Category;
