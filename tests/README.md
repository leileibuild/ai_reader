# News Reader API Testing Guide

This document outlines the comprehensive testing strategy for the News Reader backend API.

## Overview

The testing suite is designed with several key components:

- **Unit Tests**: Testing individual controller functions in isolation
- **Integration Tests**: Testing complete API endpoints end-to-end
- **MongoDB Memory Server**: Running tests against an in-memory MongoDB instance
- **Fixtures**: Predefined test data for consistent testing scenarios
- **Mocks**: Simulating database operations for true unit testing

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

## Adding New Tests

When adding new features, follow these steps to maintain test coverage:

1. Add appropriate fixtures in `tests/fixtures/`
2. For new endpoints, add integration tests in `tests/integration/routes/`
3. For new controller logic, add unit tests in `tests/unit/controllers/`
4. Verify coverage with `npm run test:coverage`
