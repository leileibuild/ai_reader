/**
 * Test fixtures for entities (topics, categories, events, notes)
 * 
 * Provides mock data for entity testing
 */
const { v4: uuidv4 } = require('uuid');

// Mock Topics
const mockTopics = [
  {
    _id: uuidv4(),
    name: "Test Topic 1",
    description: "Description for test topic 1",
    color: "#FF5733",
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: uuidv4(),
    name: "Test Topic 2",
    description: "Description for test topic 2",
    color: "#33FF57",
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  }
];

// Mock Categories
const mockCategories = [
  {
    _id: uuidv4(),
    name: "Test Category 1",
    description: "Description for test category 1",
    color: "#3357FF",
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: uuidv4(),
    name: "Test Category 2",
    description: "Description for test category 2",
    color: "#57FF33",
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  }
];

// Mock Events
const mockEvents = [
  {
    _id: uuidv4(),
    name: "Test Event 1",
    description: "Description for test event 1",
    startDate: new Date('2023-01-15'),
    endDate: new Date('2023-01-20'),
    color: "#FF33A8",
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: uuidv4(),
    name: "Test Event 2",
    description: "Description for test event 2",
    startDate: new Date('2023-02-15'),
    endDate: new Date('2023-02-20'),
    color: "#A833FF",
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  }
];

// Mock Notes
const mockNotes = [
  {
    _id: uuidv4(),
    content: "This is test note 1",
    relatedArticles: [uuidv4()],
    relatedTopics: [mockTopics[0]._id],
    relatedCategories: [],
    relatedEvents: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    _id: uuidv4(),
    content: "This is test note 2",
    relatedArticles: [uuidv4(), uuidv4()],
    relatedTopics: [],
    relatedCategories: [mockCategories[0]._id],
    relatedEvents: [mockEvents[0]._id],
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  }
];

// New entities for POST requests
const newTopic = {
  name: "New Test Topic",
  description: "Description for new test topic",
  color: "#ABCDEF"
};

const newCategory = {
  name: "New Test Category",
  description: "Description for new test category",
  color: "#FEDCBA"
};

const newEvent = {
  name: "New Test Event",
  description: "Description for new test event",
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000).toISOString(),
  color: "#123456"
};

const newNote = {
  content: "This is a new test note",
  relatedArticles: [],
  relatedTopics: [mockTopics[0]._id],
  relatedCategories: [mockCategories[0]._id],
  relatedEvents: []
};

// Combined entities for batch operations
const batchEntities = {
  topics: [newTopic],
  categories: [newCategory],
  events: [newEvent],
  notes: [newNote]
};

module.exports = {
  mockTopics,
  mockCategories,
  mockEvents,
  mockNotes,
  newTopic,
  newCategory,
  newEvent,
  newNote,
  batchEntities,
  getTopicById: (id) => mockTopics.find(topic => topic._id === id),
  getCategoryById: (id) => mockCategories.find(category => category._id === id),
  getEventById: (id) => mockEvents.find(event => event._id === id),
  getNoteById: (id) => mockNotes.find(note => note._id === id)
};
