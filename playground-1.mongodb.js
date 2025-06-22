/* global use, db */
// MongoDB Playground for News Reader Application
// This file contains common read operations for the News Reader application

// Select the database to use (replace 'news_reader' with your actual database name)
use('news_reader');

// ===== 1. ARTICLES =====
// Get all articles (with pagination)
const getAllArticles = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return db.getCollection('articles')
    .find()
    .sort({ published_date: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .toArray();
};

// Get a single article by ID
const getArticleById = (articleId) => {
  return db.getCollection('articles').findOne({ id: articleId });
};

// ===== 2. TOPICS =====
// Get all topics
const getAllTopics = (limit = 50, skip = 0) => {
  return db.getCollection('topics')
    .find()
    .sort({ priority: -1, name: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();
};

// Get topics with unread articles
const getUnreadTopics = (limit = 20) => {
  return db.getCollection('topics')
    .find({ unread_count: { $gt: 0 } })
    .sort({ priority: -1, unread_count: -1 })
    .limit(limit)
    .toArray();
};

// ===== 3. CATEGORIES =====
// Get all categories
const getAllCategories = (limit = 50, skip = 0) => {
  return db.getCollection('categories')
    .find()
    .sort({ priority: -1, name: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();
};

// Get categories with unread articles
const getUnreadCategories = (limit = 20) => {
  return db.getCollection('categories')
    .find({ unread_count: { $gt: 0 } })
    .sort({ priority: -1, unread_count: -1 })
    .limit(limit)
    .toArray();
};

// ===== 4. EVENTS =====
// Get all events
const getAllEvents = (limit = 20) => {
  return db.getCollection('events')
    .find()
    .sort({ date: -1 }) // Most recent first
    .limit(limit)
    .toArray();
};

// Get events with unread articles
const getUnreadEvents = (limit = 20) => {
  return db.getCollection('events')
    .find({ unread_count: { $gt: 0 } })
    .sort({ priority: -1, unread_count: -1 })
    .limit(limit)
    .toArray();
};

// ===== 5. NOTES =====
// Get all notes (recent first)
const getAllNotes = (limit = 20) => {
  return db.getCollection('notes')
    .find({ is_archived: false })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
};

// Get notes by tag
const getNotesByTag = (tag, limit = 20) => {
  return db.getCollection('notes')
    .find({ 
      tags: tag,
      is_archived: false
    })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
};

// ===== EXAMPLE USAGE =====
// Uncomment and run any of these examples:

// 1. Get first page of articles (20 items)
// getAllArticles(1, 20).then(console.log);

// 2. Get all topics
// getAllTopics().then(console.log);

// 3. Get unread categories
// getUnreadCategories().then(console.log);

// 4. Get recent events
// getAllEvents(10).then(console.log);

// 5. Get recent notes
// getAllNotes(10).then(console.log);
