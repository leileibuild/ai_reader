# News Reader Backend Service

This backend service provides a RESTful API for the News Reader application, allowing client applications to interact with the MongoDB database through a well-defined interface.

## API Design Philosophy

The API follows these design principles:

1. **Dedicated Article CRUD** - Full dedicated endpoints for article operations
2. **Consolidated Entity Operations** - A unified API for other entities (topics, categories, events, notes)
3. **Selective Processing** - Only processes entities included in the request payload
4. **Multi-entity Support** - Handles batch operations on multiple entities in a single request

## API Endpoints

### Article Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | Get all articles with pagination, filtering, and sorting |
| GET | `/api/articles/:id` | Get a single article by ID |
| POST | `/api/articles` | Create a new article |
| PUT | `/api/articles/:id` | Update an existing article |
| DELETE | `/api/articles/:id` | Delete an article |
| GET | `/api/articles/search` | Search articles by keyword |
| GET | `/api/articles/topic/:topicId` | Get articles by topic ID |
| GET | `/api/articles/category/:categoryId` | Get articles by category ID |
| GET | `/api/articles/event/:eventId` | Get articles by event ID |
| GET | `/api/articles/priority` | Get priority articles |
| GET | `/api/articles/unread` | Get unread articles |

### Consolidated Entity Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/entities` | Create or update multiple entities in a single request |
| GET | `/api/entities` | Get multiple entities by their IDs |
| DELETE | `/api/entities` | Delete multiple entities by their IDs |
| GET | `/api/entities/topics` | Get all topics with optional filtering |
| GET | `/api/entities/categories` | Get all categories with optional filtering |
| GET | `/api/entities/events` | Get all events with optional filtering |
| GET | `/api/entities/notes` | Get all notes with optional filtering |
| GET | `/api/entities/search` | Search across all entity types |

## Usage Examples

### Create a New Article

```http
POST /api/articles
Content-Type: application/json

{
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
}
```

### Get Articles with Filtering

```http
GET /api/articles?limit=10&skip=0&sort=published_date&order=desc&publisher=Tech%20Today
```

### Create or Update Multiple Entities

```http
POST /api/entities
Content-Type: application/json

{
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
}
```

### Get Multiple Entities

```http
GET /api/entities?topicIds=t123,t456&categoryIds=c789
```

### Search Across All Entity Types

```http
GET /api/entities/search?q=artificial%20intelligence&types=topics,articles
```

## Key Design Patterns

### Repository Pattern
The API leverages the repository pattern established in the MongoDB models, providing a clean abstraction over database operations.

### Data Transfer Objects (DTOs)
Each entity has a well-defined validation schema (using Joi) to ensure data integrity before persistence.

### Batch Processing
The consolidated API supports batch operations, allowing efficient creation, retrieval, and deletion of multiple entities in a single request.

### Selective Processing
The API only processes entities that are included in the request payload, providing flexibility for client applications to focus on relevant data.

## Error Handling

All endpoints use consistent error handling:

- **400 Bad Request** - Invalid input data
- **404 Not Found** - Resource not found
- **207 Multi-Status** - Partial success/failure in batch operations
- **500 Internal Server Error** - Unexpected server issues

## Security Considerations

- The API uses Helmet to set secure HTTP headers
- CORS is enabled for cross-origin requests
- Request body size is limited to prevent abuse

## Installation and Running the Application

### Prerequisites

- Node.js v18+ 
- MongoDB v6.0+ (must be installed and accessible)

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (optional):
   - Copy the `.env.example` file to `.env`
   - Modify settings as needed

### Running the Application

The application includes integrated development scripts that simplify the development workflow:

#### Full Development Environment (MongoDB + Backend)

```bash
npm run dev:full
```

This command:
- Checks if MongoDB is running on port 27017
- Starts MongoDB if needed, binding to localhost (127.0.0.1) for security
- Creates data and log directories automatically
- Launches the Express backend with nodemon for auto-restart
- Implements a smart shutdown process (press Ctrl+C)
  - Always terminates the backend
  - Only terminates MongoDB if it's not used by other applications

#### Backend Only

```bash
npm run dev
```

This command starts only the Express backend using nodemon, assuming MongoDB is already running.

### Security Considerations

- All services bind to localhost (127.0.0.1) only for development security
- No authentication is required for local development
- Production deployment would require additional security measures

## API Testing

You can test the API endpoints using curl or tools like Postman:

```bash
# Health check
curl http://localhost:3000/api/health

# Get all articles
curl http://localhost:3000/api/articles

# Create a new article
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "url": "https://example.com/article",
    "published_date": "2025-03-23T00:00:00.000Z",
    "source": "Example News"
  }'
```

## Next Steps for Production

- Add authentication and authorization
- Implement rate limiting
- Add request logging and monitoring
- Configure HTTPS
- Add thorough error logging
- Set up proper environment configuration
