/* global use, db */
// MongoDB Playground for News Reader Application

// CONNECTION CONFIGURATION
// =====================================
// NOTE: If you're seeing empty collections but have data in your frontend,
// try one of the other connection options below.

// OPTION 1: Default local connection
// use('news_reader');

// OPTION 2: Try another database name
use('ai_reader');

// OPTION 3: Connection with authentication (uncomment and modify as needed)
// const password = encodeURIComponent('yourpassword');
// const uri = `mongodb://username:${password}@localhost:27017/news_reader`;
// const client = Mongo(uri);
// const db = client.getDB('news_reader');

// =====================================
// Database Explorer
console.log('Connected to database:', db.getName());

// Check for available databases (might help identify the correct one)
const adminDb = db.getSiblingDB('admin');
try {
  const dbs = adminDb.runCommand({ listDatabases: 1 }).databases;
  console.log('\n=== Available Databases ===');
  dbs.forEach(db => console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`));
} catch (e) {
  console.log('Could not list databases:', e.message);
}

// List collections in current database
const collections = db.getCollectionNames();
console.log('\n=== Available Collections in', db.getName(), '===');
console.log(collections);

// Show document counts
console.log('\n=== Collection Document Counts ===');
collections.forEach(collectionName => {
  const count = db[collectionName].countDocuments();
  console.log(`${collectionName}: ${count} documents`);
});

// Check topics collection in more detail
console.log('\n=== Topics Collection ===');
if (collections.includes('topics')) {
  const topics = db.topics.find().limit(5).toArray();
  if (topics.length > 0) {
    console.log(`Found ${topics.length} topics:`);
    topics.forEach((topic, i) => {
      console.log(`\n[${i+1}] ${topic.name || topic.id || 'Unnamed topic'}`);
      console.log('Fields:', Object.keys(topic));
    });
  } else {
    console.log('Topics collection is empty');
  }
} else {
  console.log('No topics collection found');
}

// Check categories collection in more detail
console.log('\n=== Categories Collection ===');
if (collections.includes('categories')) {
  const categories = db.categories.find().limit(5).toArray();
  if (categories.length > 0) {
    console.log(`Found ${categories.length} categories:`);
    categories.forEach((category, i) => {
      console.log(`\n[${i+1}] ${category.name || category.id || 'Unnamed category'}`);
      console.log('Fields:', Object.keys(category));
    });
  } else {
    console.log('Categories collection is empty');
  }
} else {
  console.log('No categories collection found');
}

// Check articles collection in more detail
console.log('\n=== Articles Collection ===');
if (collections.includes('articles')) {
  const articles = db.articles.find().limit(3).toArray();
  if (articles.length > 0) {
    console.log(`Found ${articles.length} articles:`);
    articles.forEach((article, i) => {
      console.log(`\n[${i+1}] ${article.title || article.id || 'Untitled'}`);
      console.log('Fields:', Object.keys(article));
    });
  } else {
    console.log('Articles collection is empty');
  }
} else {
  console.log('No articles collection found');
}
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
