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

## Getting Started

### Prerequisites

- Node.js (v12+)
- MongoDB (v4.4+)

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

### Health Check

```bash
# Check API health
curl -X GET http://localhost:3000/api/health
```

### Article APIs

#### Get All Articles

```bash
# Get all articles with pagination and filtering
curl -X GET "http://localhost:3000/api/articles?limit=10&skip=0&sort=published_date&order=desc&publisher=Tech%20Today"
```

#### Get Article By ID

```bash
# Get a specific article by ID
curl -X GET http://localhost:3000/api/articles/article123
```

#### Create New Article

```bash
# Create a new article
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Future of AI in 2025",
    "publisher": "Tech Today",
    "author": "Jane Smith",
    "published_date": "2025-03-15T09:00:00Z",
    "url": "https://techtoday.com/ai-future-2025",
    "summary": "An in-depth look at how AI will shape our world in the coming years.",
    "keywords": ["AI", "machine learning", "future tech", "2025"],
    "topics_ids": ["t123", "t456"],
    "categories_ids": ["c789"],
    "unread_count": 1,
    "priority": 3
  }'
```

#### Update Article

```bash
# Update an existing article
curl -X PUT http://localhost:3000/api/articles/article123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: The Future of AI in 2025",
    "summary": "Revised summary with new information about AI developments.",
    "priority": 5
  }'
```

#### Delete Article

```bash
# Delete an article
curl -X DELETE http://localhost:3000/api/articles/article123
```

#### Search Articles

```bash
# Search articles by keyword
curl -X GET "http://localhost:3000/api/articles/search?q=artificial%20intelligence&limit=10"
```

#### Get Articles by Topic

```bash
# Get articles for a specific topic
curl -X GET http://localhost:3000/api/articles/topic/topic123
```

#### Get Articles by Category

```bash
# Get articles for a specific category
curl -X GET http://localhost:3000/api/articles/category/category123
```

#### Get Articles by Event

```bash
# Get articles for a specific event
curl -X GET http://localhost:3000/api/articles/event/event123
```

#### Get Priority Articles

```bash
# Get priority articles
curl -X GET http://localhost:3000/api/articles/priority?limit=10
```

#### Get Unread Articles

```bash
# Get unread articles
curl -X GET http://localhost:3000/api/articles/unread?limit=20
```

### Consolidated Entity APIs

#### Create or Update Multiple Entities

```bash
# Create or update multiple entities in a single request
curl -X POST http://localhost:3000/api/entities \
  -H "Content-Type: application/json" \
  -d '{
    "topics": [
      {
        "name": "Artificial Intelligence",
        "description": "News and developments in AI",
        "keywords": ["AI", "machine learning", "neural networks"],
        "priority": 5
      }
    ],
    "categories": [
      {
        "name": "Technology",
        "description": "Technology news and updates",
        "subcategories": [
          {
            "id": "sub123",
            "name": "Software Development",
            "description": "News about software development"
          }
        ],
        "priority": 4
      }
    ],
    "notes": [
      {
        "content": "This article offers interesting insights on AI development.",
        "reference_type": "article",
        "reference_id": "a123",
        "tags": ["important", "follow-up"]
      }
    ]
  }'
```

#### Get Multiple Entities

```bash
# Get multiple entities by their IDs
curl -X GET "http://localhost:3000/api/entities?topicIds=t123,t456&categoryIds=c789"
```

#### Delete Multiple Entities

```bash
# Delete multiple entities
curl -X DELETE http://localhost:3000/api/entities \
  -H "Content-Type: application/json" \
  -d '{
    "topicIds": ["t123", "t456"],
    "noteIds": ["n789"]
  }'
```

#### Get All Topics

```bash
# Get all topics with pagination
curl -X GET "http://localhost:3000/api/entities/topics?limit=20&skip=0"
```

#### Get All Categories

```bash
# Get all categories with pagination
curl -X GET "http://localhost:3000/api/entities/categories?limit=20&skip=0"
```

#### Get All Events

```bash
# Get all events with pagination
curl -X GET "http://localhost:3000/api/entities/events?limit=20&skip=0"
```

#### Get All Notes

```bash
# Get all notes with pagination
curl -X GET "http://localhost:3000/api/entities/notes?limit=20&skip=0"
```

#### Search Across All Entity Types

```bash
# Search across all entity types
curl -X GET "http://localhost:3000/api/entities/search?q=artificial%20intelligence&types=topics,articles"
```

## Response Formats

### Success Responses

Successful responses follow this general structure:

```json
{
  "success": true,
  "data": { ... },  // For single entity operations
  // OR
  "articles": [ ... ],  // For article list endpoints
  // OR 
  "created": { ... },   // For creation operations
  "updated": { ... },
  "pagination": {       // For list endpoints
    "total": 100,
    "limit": 10,
    "skip": 0,
    "hasMore": true
  }
}
```

### Error Responses

Error responses follow this structure:

```json
{
  "error": {
    "message": "Error message",
    "details": [ ... ]  // Optional validation details
  }
}
```

## Contributing

This project is currently in the POC phase. For substantial changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
