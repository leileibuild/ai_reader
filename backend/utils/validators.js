/**
 * Data validation utilities for API requests
 * 
 * This module provides schema validation for entity data using Joi.
 * Each validator function returns { error, value } where error is null if validation succeeds.
 */
const Joi = require('joi');

/**
 * Validate article data
 * 
 * @param {Object} data - Article data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (partial data allowed)
 * @returns {Object} Validation result with error and value properties
 */
function validateArticle(data, isUpdate = false) {
  // Define article schema
  const schema = Joi.object({
    id: Joi.string().trim(),
    title: isUpdate ? Joi.string().trim() : Joi.string().trim().required(),
    publisher: Joi.string().trim().allow(''),
    author: Joi.string().trim().allow(''),
    published_date: Joi.date(),
    url: isUpdate ? Joi.string().uri() : Joi.string().uri().required(),
    summary: Joi.string().allow(''),
    image_urls: Joi.array().items(Joi.string().uri()),
    keywords: Joi.array().items(Joi.string().trim()),
    topics_ids: Joi.array().items(Joi.string().trim()),
    categories_ids: Joi.array().items(Joi.string().trim()),
    related_topics_ids: Joi.array().items(Joi.string().trim()),
    events_ids: Joi.array().items(Joi.string().trim()),
    topics_scores: Joi.object(),
    events_scores: Joi.object(),
    original_article: Joi.object(),
    unread_count: Joi.number().integer().min(0),
    priority: Joi.number().integer().min(0).max(10)
  });
  
  // Validate data
  return schema.validate(data, { 
    stripUnknown: true,
    abortEarly: false
  });
}

/**
 * Validate topic data
 * 
 * @param {Object} data - Topic data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (partial data allowed)
 * @returns {Object} Validation result with error and value properties
 */
function validateTopic(data, isUpdate = false) {
  // Define topic schema
  const schema = Joi.object({
    id: Joi.string().trim(),
    name: isUpdate ? Joi.string().trim() : Joi.string().trim().required(),
    description: Joi.string().allow(''),
    image_urls: Joi.array().items(Joi.string().uri()),
    keywords: Joi.array().items(Joi.string().trim()),
    articles_ids: Joi.array().items(Joi.string().trim()),
    categories_ids: Joi.array().items(Joi.string().trim()),
    related_topics_ids: Joi.array().items(Joi.string().trim()),
    timeline: Joi.object(),
    unread_count: Joi.number().integer().min(0),
    priority: Joi.number().integer().min(0).max(10)
  });
  
  // Validate data
  return schema.validate(data, { 
    stripUnknown: true,
    abortEarly: false
  });
}

/**
 * Validate category data
 * 
 * @param {Object} data - Category data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (partial data allowed)
 * @returns {Object} Validation result with error and value properties
 */
function validateCategory(data, isUpdate = false) {
  // Define subcategory schema
  const subcategorySchema = Joi.object({
    id: Joi.string().trim().required(),
    name: Joi.string().trim().required(),
    description: Joi.string().allow(''),
    topics_ids: Joi.array().items(Joi.string().trim()),
    unread_count: Joi.number().integer().min(0),
    priority: Joi.number().integer().min(0).max(10)
  });
  
  // Define category schema
  const schema = Joi.object({
    id: Joi.string().trim(),
    name: isUpdate ? Joi.string().trim() : Joi.string().trim().required(),
    description: Joi.string().allow(''),
    image_urls: Joi.array().items(Joi.string().uri()),
    keywords: Joi.array().items(Joi.string().trim()),
    topics_ids: Joi.array().items(Joi.string().trim()),
    subcategories: Joi.array().items(subcategorySchema),
    unread_count: Joi.number().integer().min(0),
    priority: Joi.number().integer().min(0).max(10)
  });
  
  // Validate data
  return schema.validate(data, { 
    stripUnknown: true,
    abortEarly: false
  });
}

/**
 * Validate event data
 * 
 * @param {Object} data - Event data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (partial data allowed)
 * @returns {Object} Validation result with error and value properties
 */
function validateEvent(data, isUpdate = false) {
  // Define timeline item schema
  const timelineItemSchema = Joi.object({
    date: Joi.date().required(),
    description: Joi.string().required(),
    articles_ids: Joi.array().items(Joi.string().trim())
  });
  
  // Define event schema
  const schema = Joi.object({
    id: Joi.string().trim(),
    date: isUpdate ? Joi.date() : Joi.date().required(),
    description: isUpdate ? Joi.string() : Joi.string().required(),
    image_urls: Joi.array().items(Joi.string().uri()),
    related_events_ids: Joi.array().items(Joi.string().trim()),
    articles_ids: Joi.array().items(Joi.string().trim()),
    timeline: Joi.array().items(timelineItemSchema),
    unread_count: Joi.number().integer().min(0),
    priority: Joi.number().integer().min(0).max(10)
  });
  
  // Validate data
  return schema.validate(data, { 
    stripUnknown: true,
    abortEarly: false
  });
}

/**
 * Validate note data
 * 
 * @param {Object} data - Note data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (partial data allowed)
 * @returns {Object} Validation result with error and value properties
 */
function validateNote(data, isUpdate = false) {
  // Define valid reference types
  const validReferenceTypes = ['article', 'topic', 'category', 'event'];
  
  // Define note schema
  const schema = Joi.object({
    id: Joi.string().trim(),
    content: isUpdate ? Joi.string() : Joi.string().required(),
    created_at: Joi.date(),
    updated_at: Joi.date(),
    reference_type: isUpdate 
      ? Joi.string().valid(...validReferenceTypes) 
      : Joi.string().valid(...validReferenceTypes).required(),
    reference_id: isUpdate ? Joi.string().trim() : Joi.string().trim().required(),
    tags: Joi.array().items(Joi.string().trim()),
    metadata: Joi.object(),
    priority: Joi.number().integer().min(0).max(10),
    is_archived: Joi.boolean()
  });
  
  // Validate data
  return schema.validate(data, { 
    stripUnknown: true,
    abortEarly: false
  });
}

module.exports = {
  validateArticle,
  validateTopic,
  validateCategory,
  validateEvent,
  validateNote
};
