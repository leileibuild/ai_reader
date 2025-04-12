# News Reader MongoDB Directory

This directory contains the MongoDB schema definitions and models for the News Reader application. The structure is designed to provide a clean, modular approach to interacting with the database while maintaining schema validation for data integrity.

## Directory Structure

```
/mongodb
  /schemas          # JSON Schema validation files for MongoDB collections
  /models           # Model classes with business logic for each entity
  db.js             # Database connection and initialization
  db_schema_erd.md  # Entity Relationship Diagram
  README.md         # This file
```

## Schema Design

The application uses MongoDB's document-oriented approach to store news reading data with the following collections:

- **Articles**: News articles with metadata and content references
- **Topics**: Subject areas that group related articles
- **Categories**: High-level classifications with embedded subcategories
- **Events**: Specific happenings with their own timelines
- **Notes**: User annotations linked to any of the above entities

Each schema includes appropriate validation rules to ensure data integrity, while the models provide a clean API for common operations.

## Getting Started

### Prerequisites

- MongoDB (v4.4+) installed locally or accessible via network
- Node.js (v12+)

### Installation

1. Install MongoDB dependencies:

```bash
npm install mongodb
```

2. Set up MongoDB server (if running locally):

```bash
# Start MongoDB service
brew services start mongodb-community@4.4  # For macOS

# Or manually start MongoDB
mongod --dbpath=/path/to/data/directory
```

## Usage

### Connecting to the Database

```javascript
const db = require('./mongodb/db');

async function main() {
  // Connect with default settings (localhost:27017/news_reader)
  const { models } = await db.connect();
  
  // Or connect with custom settings
  // const { models } = await db.connect('mongodb://custom-host:27017', 'custom_db_name');
  
  // Now you can use the models
  const articles = await models.articles.getRecent(10);
  console.log(articles);
  
  // Close the connection when done
  await db.close();
}

main().catch(console.error);
```

### Working with Models

Each model provides methods for common CRUD operations and additional functionality:

```javascript
const db = require('./mongodb/db');

async function createArticle() {
  const { models } = await db.connect();
  
  const article = await models.articles.create({
    title: "Sample Article",
    publisher: "Tech News",
    author: "Jane Doe",
    published_date: new Date(),
    url: "https://example.com/article-1",
    summary: "This is a sample article for demonstration",
    keywords: ["sample", "test", "demo"],
    unread_count: 1,
    priority: 3
  });
  
  console.log('Created article:', article);
  
  await db.close();
}

createArticle().catch(console.error);
```

## Schema Validation

The application uses MongoDB's JSON Schema validation to ensure data integrity. This means documents must conform to the defined schema or they'll be rejected by the database, preventing inconsistent data.

## Entity Relationships

The schema uses a combination of embedding and referencing:

- Small, frequently accessed data is embedded (e.g., subcategories within categories)
- Larger, less frequently accessed data uses references (e.g., articles referenced by topics)

For a visual representation of entity relationships, see the [ERD diagram](./db_schema_erd.md).

## Additional Notes for Development

- **Indexing**: Indexes are automatically created on frequently queried fields when collections are initialized.
- **Error Handling**: The database connection module includes basic error handling for common scenarios.
- **Lightweight Structure**: The POC design favors simplicity while maintaining good database practices.

## POC Limitations and Future Enhancements

As this is a proof of concept, some advanced features are not implemented but could be added in the future:

- Authentication and authorization
- Advanced caching strategies
- Sharding for horizontal scaling
- Aggregation pipelines for analytics
- Change streams for real-time updates
- Connection pooling optimization

## Testing the Connection

To test your MongoDB connection, you can run:

```javascript
// test-connection.js
const db = require('./mongodb/db');

async function testConnection() {
  try {
    const { models } = await db.connect();
    console.log('Successfully connected to MongoDB');
    
    // Test category creation
    const category = await models.categories.create({
      name: "Technology",
      description: "Tech news and updates",
      keywords: ["tech", "software", "hardware"],
      unread_count: 0,
      priority: 5
    });
    
    console.log('Created test category:', category);
    await db.close();
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
```

Run this script with:
```bash
node test-connection.js
```
