# News Reader API Testing Guide

This document outlines the comprehensive testing strategy for the News Reader backend API.

## Overview

The testing suite is designed with several key components:

- **Unit Tests**: Testing individual controller functions in isolation
- **Integration Tests**: Testing complete API endpoints end-to-end
- **MongoDB Memory Server**: Running tests against an in-memory MongoDB instance
- **Fixtures**: Predefined test data for consistent testing scenarios
- **Mocks**: Simulating database operations for true unit testing
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertions for API testing

## Test Structure

```
tests/
├── config/                   # Test configuration
│   ├── mongodb-test-helper.js  # MongoDB in-memory setup
│   ├── setup.js               # Jest setup file
│   ├── supertest-helper.js    # Express/Supertest utilities
│   └── test-data-helper.js    # Test data population utilities
│
├── fixtures/                 # Test data
│   ├── article-fixtures.js    # Article mock data
│   └── entity-fixtures.js     # Entity mock data (topics, categories, etc.)
│
├── integration/              # Integration tests
│   └── routes/
│       ├── article.routes.test.js  # Article API endpoint tests
│       └── entity.routes.test.js   # Entity API endpoint tests
│
├── unit/                     # Unit tests
│   └── controllers/
│       ├── article.controller.test.js  # Article controller tests
│       └── entity.controller.test.js   # Entity controller tests
│
└── README.md                 # This file
```

## Running Tests

Tests can be run using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite aims for high coverage of:

- All API endpoints
- All controller logic
- Success and error states
- Edge cases and validations

## Test Categories

### Article API Tests

- **GET /api/articles**
  - Get all articles with pagination
  - Filter by query parameters
  - Sort by specified fields

- **GET /api/articles/:id**
  - Get article by valid ID
  - Handle non-existent article
  - Handle invalid ID format

- **POST /api/articles**
  - Create valid article
  - Handle invalid article data

- **PUT /api/articles/:id**
  - Update existing article
  - Handle non-existent article

- **DELETE /api/articles/:id**
  - Delete existing article
  - Handle non-existent article

- **GET /api/articles/search**
  - Search by keyword
  - Handle empty search results

- **GET /api/articles/topic/:topicId**
  - Get articles by topic
  - Handle invalid topic ID

### Entity API Tests

- **POST /api/entities**
  - Create multiple new entities
  - Update existing entities
  - Handle validation errors

- **GET /api/entities**
  - Get entities by IDs
  - Handle non-existent IDs

- **DELETE /api/entities**
  - Delete multiple entities
  - Handle empty delete request

- **GET /api/entities/topics**
  - Get all topics with filtering

- **GET /api/entities/search**
  - Search across entity types
  - Handle missing search query

## Best Practices

1. **Isolated Tests**: Each test should be independent and not rely on the state from previous tests.

2. **Clean Database**: The database is cleaned before each test to ensure consistent results.

3. **Mock External Dependencies**: When testing controllers in isolation, external dependencies are mocked.

4. **Comprehensive Assertions**: Tests verify both the response format and the actual database state.

5. **Error Handling**: Tests cover both success and error cases.

6. **Realistic Test Data**: Use realistic but deterministic values in test fixtures.

7. **Code Coverage**: Aim for high coverage of all API endpoints, controller logic, success/error states, and edge cases.

8. **Test Documentation**: Include clear descriptions in test cases explaining what's being tested.

## Adding New Tests

When adding new features, follow these steps to maintain test coverage:

1. Add appropriate fixtures in `tests/fixtures/`
2. For new endpoints, add integration tests in `tests/integration/routes/`
3. For new controller logic, add unit tests in `tests/unit/controllers/`
4. Verify coverage with `npm run test:coverage`

## Writing Tests

1. **Unit Tests**: Test individual functions in isolation
   - Place in `tests/unit/`
   - Use mocks for external dependencies
   - Focus on business logic validation

2. **Integration Tests**: Test API endpoints end-to-end
   - Place in `tests/integration/`
   - Use the MongoDB memory server for database operations
   - Validate HTTP status codes, response formats, and data persistence
   - Test parameter validation and error handling

3. **Fixtures**: Define test data in `tests/fixtures/`
   - Keep test data consistent across tests
   - Structure fixtures to be easily adaptable for different test scenarios
   - Include edge cases in fixtures when possible

### Example Test Case

```javascript
// Example integration test
describe('GET /api/articles', () => {
  beforeEach(async () => {
    // Populate test data using fixtures
    await populateArticles();
  });

  it('should return paginated articles with default limits', async () => {
    const res = await request(app)
      .get('/api/articles')
      .expect(200);
      
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.articles)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });
  
  it('should filter articles by publisher', async () => {
    const res = await request(app)
      .get('/api/articles?publisher=Tech%20Today')
      .expect(200);
      
    const allFromPublisher = res.body.articles
      .every(article => article.publisher === 'Tech Today');
    expect(allFromPublisher).toBe(true);
  });
});
```
