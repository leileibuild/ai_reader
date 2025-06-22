# News Reader Application

A MongoDB-powered news reading application that helps users organize, track, and annotate news articles across topics, categories, and events.

## Project Overview

This application provides a structured way to store and access news articles with related metadata such as topics, categories, events, and user notes. The application is currently in the Proof of Concept (POC) phase, focusing on essential features and a clean architecture.

## Directory Structure

```
/news_reader
  /mongodb            # MongoDB schemas and models
    /schemas          # JSON Schema validation files
    /models           # Model classes with business logic
    db.js             # Database connection handling
    db_schema_erd.md  # Entity Relationship Diagram
    
  /backend            # Backend API service
    /routes           # API endpoint definitions
    /controllers      # Business logic implementation
    /utils            # Helper functions and validators
    /middlewares      # (Reserved for auth, logging, etc.)
    /config           # (Reserved for environment configs)
    
  server.js           # Main Express application
  package.json        # Node.js dependencies
```

## Testing

The application includes a comprehensive test suite for maintaining code quality and preventing regressions.

- **Framework**: Jest with Supertest for API testing 
- **Strategy**: Unit tests for business logic, integration tests for API endpoints
- **Isolation**: MongoDB Memory Server for database tests

Detailed testing documentation is available in the [tests/README.md](./tests/README.md) file.

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+ or use MongoDB Atlas)
- npm (v6+)

### Installation

1. Clone this repository
2. Install dependencies:

```bash
cd news_reader
npm install
```

3. Start MongoDB (if running locally):

```bash
# On macOS with Homebrew
brew services start mongodb-community@4.4

# Or start MongoDB manually
mongod --dbpath=/path/to/data/directory
```

4. Start the application:

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

5. The server will start at http://localhost:3000 with a health check endpoint at http://localhost:3000/api/health

## Architecture & Design Decisions

### 1. MongoDB Document Model

The data model leverages MongoDB's document-oriented structure to efficiently organize news-related data:

- **Main Entities**: Articles, Topics, Categories, Events, and Notes
- **Embedded Documents**: Used for subcategories and timeline items to optimize reads
- **References**: Used for relationships between entities using ID references
- **Schema Validation**: Each collection uses MongoDB's schema validation to ensure data integrity

#### Entity Relationship Diagram

```
+-------------+       +------------+       +------------+
|   Article   |       |   Topic    |       |  Category  |
+-------------+       +------------+       +------------+
| id          |<----->| id         |<----->| id         |
| title       |       | name       |       | name       |
| publisher   |       | description|       | description|
| author      |       | image_urls |       | image_urls |
| published_dt|       | keywords   |       | keywords   |
| url         |       | articles[] |       | topics[]   |
| summary     |       | categories[]       | subcategories[]
| image_urls[]|       | related[]  |       |
| keywords[]  |       +------------+       +------------+
| topics[]    |             ^                    ^
| categories[]|             |                    |
| events[]    |             |                    |
| priority    |       +------------+             |
+-------------+       |   Event    |             |
      ^               +------------+             |
      |               | id         |             |
      |               | date       |             |
      |               | description|             |
      |               | image_urls[]             |
      |               | articles[] |             |
      |               | related[]  |             |
      |               | timeline{} |             |
      |               +------------+             |
      |                                         |
      |                                         |
      v                                         v
+-------------+                                 |
|    Note     |                                 |
+-------------+                                 |
| id          |                                 |
| content     |<--------------------------------+
| created_at  |
| updated_at  |
| reference_type (article/topic/category/event)|
| reference_id|                                 
| tags[]      |                                 
| priority    |                                 
| is_archived |                                 
+-------------+                                 
```

#### Key Relationships

- **Article** references Topics, Categories, and Events through ID arrays
- **Topic** references Articles and Categories through ID arrays
- **Category** references Topics and contains embedded Subcategories
- **Event** references Articles and related Events, contains embedded Timeline items
- **Note** references any entity type (Article, Topic, Category, or Event) through reference_type and reference_id

### 2. Backend API Architecture

The backend follows several key design principles:

- **Dedicated Article CRUD**: Full RESTful endpoints for article operations
- **Consolidated Entity Operations**: A unified API for other entities (topics, categories, events, notes)
- **Selective Processing**: Only processes entities included in the request payload
- **Multi-entity Support**: Handles batch operations on multiple entities in a single request

### 3. Key Design Patterns

- **Repository Pattern**: Models abstract database operations into a clean API
- **Data Validation**: Schema validation using Joi before persistence
- **Batch Processing**: Support for operations on multiple entities in a single request
- **Middleware Architecture**: Express middleware for request processing and error handling

### 4. POC Considerations

- Focus on core functionality without excessive complexity
- Flexible architecture for future enhancements
- Optimized for development and rapid iteration

## API Documentation

The News Reader application provides a comprehensive RESTful API for interacting with articles and related entities.

### Authentication
Currently, the API does not require authentication for development purposes. In a production environment, you should implement proper authentication.

### Rate Limiting
Rate limiting is not currently implemented but is recommended for production use. Consider implementing rate limiting based on your specific requirements.

## API Endpoints Reference

### 1. Article API (`/api/articles`)

#### Get All Articles
```bash
# Get paginated articles with filtering and sorting
curl -X GET "http://localhost:3000/api/articles?limit=10&skip=0&sort=published_date&order=desc&publisher=Tech%20Today"
```

#### Create Article
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \

  -d '{
    "title": "AI Breakthrough 2025",
    "url": "https://example.com/ai-2025",
    "content": "Detailed article content...",
    "categories_ids": ["cat_123"],
    "topics_ids": ["topic_456"],
    "metadata": {
      "author": "Jane Smith",
      "published_date": "2025-06-22T08:00:00Z",
      "source": "Tech Today"
    }
  }'
```

#### Get Article by ID
```bash
curl -X GET "http://localhost:3000/api/articles/article_123"
```

#### Update Article
```bash
curl -X PUT http://localhost:3000/api/articles/article_123 \
  -H "Content-Type: application/json" \

  -d '{
    "title": "Updated: AI Breakthrough 2025",
    "metadata": {
      "is_updated": true
    }
  }'
```

#### Delete Article
```bash
curl -X DELETE "http://localhost:3000/api/articles/article_123"
```

### 2. Entity API (`/api/entities`)

#### Batch Create/Update Entities
```bash
# Create or update multiple entities in a single request
curl -X POST http://localhost:3000/api/entities \
  -H "Content-Type: application/json" \
  -d '{
    "topics": [{
      "id": "topic_ai",
      "name": "Artificial Intelligence",
      "description": "AI and Machine Learning"
    }],
    "categories": [{
      "id": "cat_tech",
      "name": "Technology",
      "description": "Tech news and updates",
      "priority": 1
    }],
    "events": [{
      "id": "event_conf_2025",
      "date": "2025-05-15T00:00:00Z",
      "description": "Annual Tech Conference 2025"
    }],
    "notes": [{
      "id": "note_1",
      "content": "Important note about AI trends",
      "reference_type": "topic",
      "reference_id": "topic_ai"
    }]
  }'
```

#### Get Multiple Entities by IDs
```bash
# Get specific entities by their IDs
curl -X GET "http://localhost:3000/api/entities?topicIds=topic_ai,topic_ml&categoryIds=cat_tech&eventIds=event_conf_2025"

# Get all entities of a specific type
curl -X GET "http://localhost:3000/api/entities/categories"
curl -X GET "http://localhost:3000/api/entities/topics"
curl -X GET "http://localhost:3000/api/entities/events"
curl -X GET "http://localhost:3000/api/entities/notes"
```

#### Delete Entities
```bash
# Delete multiple entities by their IDs
curl -X DELETE http://localhost:3000/api/entities \
  -H "Content-Type: application/json" \
  -d '{
    "topicIds": ["topic_ai"],
    "categoryIds": ["cat_tech"],
    "eventIds": ["event_conf_2025"],
    "noteIds": ["note_1"]
  }'
```

#### Get Entity by ID
```bash
# Get a specific entity by ID and type
curl -X GET "http://localhost:3000/api/entities/topics/topic_ai"
curl -X GET "http://localhost:3000/api/entities/categories/cat_tech"
curl -X GET "http://localhost:3000/api/entities/events/event_conf_2025"
curl -X GET "http://localhost:3000/api/entities/notes/note_1"
```

### 3. Entity Search (`/api/entities/search`)

#### Search Across Entities
```bash
# Search across all entity types
curl -X GET "http://localhost:3000/api/entities/search?q=artificial%20intelligence"

# Search specific entity types
curl -X GET "http://localhost:3000/api/entities/search?q=technology&types=topics,categories"
```

### 4. Article Search (`/api/articles/search`)

#### Search Articles
```bash
# Search articles by keyword
curl -X GET "http://localhost:3000/api/articles/search?query=artificial%20intelligence"
```

### 5. Articles by Topic, Category, Event (`/api/articles/topic`, `/api/articles/category`, `/api/articles/event`)

#### Get Articles by Topic
```bash
# Get articles for a specific topic
curl -X GET "http://localhost:3000/api/articles/topic/topic123"
```

#### Get Articles by Category
```bash
# Get articles for a specific category
curl -X GET "http://localhost:3000/api/articles/category/category123"
```

#### Get Articles by Event
```bash
# Get articles for a specific event
curl -X GET "http://localhost:3000/api/articles/event/event123"
```

### 6. Priority and Unread Articles (`/api/articles/priority`, `/api/articles/unread`)

#### Get Priority Articles
```bash
# Get priority articles
curl -X GET "http://localhost:3000/api/articles/priority"
```

#### Get Unread Articles
```bash
# Get unread articles
curl -X GET "http://localhost:3000/api/articles/unread"
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "article_123",
    "title": "AI Breakthrough 2025",
    "url": "https://example.com/ai-2025"
  },
  "pagination": {
    "total": 42,
    "limit": 10,
    "skip": 0,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "error": {
    "message": "Article not found",
    "code": "NOT_FOUND",
    "details": [{
      "field": "id",
      "message": "No article found with ID article_999"
    }]
  }
}
```

### Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Contributing

This project is currently in the POC phase. For substantial changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
