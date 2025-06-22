/**
 * Test fixtures for articles
 * 
 * Provides mock data for article testing
 */
const { v4: uuidv4 } = require('uuid');

const mockArticles = [
  {
    _id: uuidv4(),
    title: "Test Article 1",
    content: "This is test content for article 1",
    summary: "Summary of test article 1",
    url: "https://example.com/article1",
    source: "Test Source",
    author: "Test Author",
    publishedDate: new Date('2023-01-01'),
    categories: [uuidv4(), uuidv4()],
    topics: [uuidv4()],
    events: [],
    isRead: false,
    isPriority: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: uuidv4(),
    title: "Test Article 2",
    content: "This is test content for article 2",
    summary: "Summary of test article 2",
    url: "https://example.com/article2",
    source: "Test Source 2",
    author: "Test Author 2",
    publishedDate: new Date('2023-01-02'),
    categories: [uuidv4()],
    topics: [uuidv4(), uuidv4()],
    events: [uuidv4()],
    isRead: true,
    isPriority: false,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  }
];

const newArticle = {
  title: "New Test Article",
  content: "This is content for a new test article",
  summary: "Summary of new test article",
  url: "https://example.com/new-article",
  source: "New Test Source",
  author: "New Test Author",
  publishedDate: new Date().toISOString(),
  categories: [uuidv4()],
  topics: [uuidv4()],
  events: []
};

const updatedArticle = {
  title: "Updated Article Title",
  content: "Updated content for test article",
  isPriority: true,
};

module.exports = {
  mockArticles,
  newArticle,
  updatedArticle,
  getArticleById: (id) => mockArticles.find(article => article._id === id)
};
