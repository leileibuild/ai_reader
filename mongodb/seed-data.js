/**
 * MongoDB Data Seeding Script for News Reader Application
 * 
 * This script creates sample data for the knowledge graph visualization:
 * - Categories (top-level nodes)
 * - Subcategories (mid-level nodes)
 * - Topics (leaf nodes)
 * 
 * The data structure follows the schema defined in db_schema_erd.md
 */

// Dependencies
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Connection URL & Database Name
const url = 'mongodb://localhost:27017';
const dbName = 'news_reader';

// Sample Data
const sampleCategories = [
  {
    id: 'cat1',
    name: 'Technology',
    description: 'News and developments in the technology sector',
    keywords: ['tech', 'digital', 'innovation'],
    image_urls: [],
    topics_ids: ['topic3', 'topic4'],
    unread_count: 12,
    priority: 2,
    subcategories: [
      {
        id: 'subcat1',
        name: 'Artificial Intelligence',
        description: 'Machine learning, neural networks, and AI research',
        keywords: ['AI', 'ML', 'deep learning'],
        unread_count: 5,
        topics_ids: ['topic1', 'topic2']
      },
      {
        id: 'subcat2',
        name: 'Cybersecurity',
        description: 'Digital security, threats, and protective measures',
        keywords: ['security', 'hacking', 'privacy'],
        unread_count: 7,
        topics_ids: ['topic3']
      }
    ]
  },
  {
    id: 'cat2',
    name: 'Business',
    description: 'Corporate news, markets, and economic developments',
    keywords: ['finance', 'economy', 'markets'],
    image_urls: [],
    topics_ids: ['topic5', 'topic6'],
    unread_count: 8,
    priority: 1,
    subcategories: [
      {
        id: 'subcat3',
        name: 'Finance',
        description: 'Banking, investments, and financial markets',
        keywords: ['investing', 'markets', 'banking'],
        unread_count: 3,
        topics_ids: ['topic5']
      }
    ]
  },
  {
    id: 'cat3',
    name: 'Politics',
    description: 'Government affairs, policy, and political developments',
    keywords: ['government', 'policy', 'elections'],
    image_urls: [],
    topics_ids: ['topic8', 'topic9'],
    unread_count: 15,
    priority: 3,
    subcategories: [
      {
        id: 'subcat4',
        name: 'International Relations',
        description: 'Diplomacy, global affairs, and international cooperation',
        keywords: ['diplomacy', 'foreign policy', 'international'],
        unread_count: 6,
        topics_ids: ['topic8', 'topic9']
      }
    ]
  }
];

const sampleTopics = [
  {
    id: 'topic1',
    name: 'Machine Learning',
    description: 'Statistical techniques enabling computers to improve based on experience',
    keywords: ['algorithms', 'neural networks', 'deep learning'],
    articles_ids: [],
    categories_ids: ['cat1'],
    related_topics_ids: ['topic2'],
    unread_count: 3
  },
  {
    id: 'topic2',
    name: 'Natural Language Processing',
    description: 'Processing and analyzing human language with AI',
    keywords: ['NLP', 'text analysis', 'language models'],
    articles_ids: [],
    categories_ids: ['cat1'],
    related_topics_ids: ['topic1'],
    unread_count: 2
  },
  {
    id: 'topic3',
    name: 'Data Privacy',
    description: 'Protecting personal and sensitive information',
    keywords: ['privacy', 'data protection', 'GDPR'],
    articles_ids: [],
    categories_ids: ['cat1'],
    related_topics_ids: ['topic8'],
    unread_count: 4
  },
  {
    id: 'topic4',
    name: 'Cloud Computing',
    description: 'On-demand availability of computer system resources',
    keywords: ['cloud', 'SaaS', 'distributed computing'],
    articles_ids: [],
    categories_ids: ['cat1'],
    related_topics_ids: [],
    unread_count: 1
  },
  {
    id: 'topic5',
    name: 'Stock Market',
    description: 'News and analysis about equity markets',
    keywords: ['stocks', 'equities', 'trading'],
    articles_ids: [],
    categories_ids: ['cat2'],
    related_topics_ids: ['topic9'],
    unread_count: 2
  },
  {
    id: 'topic6',
    name: 'Startups',
    description: 'Emerging companies and entrepreneurship',
    keywords: ['entrepreneurship', 'venture capital', 'innovation'],
    articles_ids: [],
    categories_ids: ['cat2'],
    related_topics_ids: [],
    unread_count: 3
  },
  {
    id: 'topic8',
    name: 'Diplomacy',
    description: 'International dialogue and negotiation between nations',
    keywords: ['international relations', 'treaties', 'negotiations'],
    articles_ids: [],
    categories_ids: ['cat3'],
    related_topics_ids: ['topic9', 'topic3'],
    unread_count: 3
  },
  {
    id: 'topic9',
    name: 'Trade Agreements',
    description: 'International trade policies and economic partnerships',
    keywords: ['trade', 'tariffs', 'economic cooperation'],
    articles_ids: [],
    categories_ids: ['cat3'],
    related_topics_ids: ['topic5', 'topic8'],
    unread_count: 3
  }
];

// Connect to DB and seed data
async function seedDatabase() {
  const client = new MongoClient(url);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    const db = client.db(dbName);
    
    // Check for existing collections and create if needed
    try {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      if (!collectionNames.includes('categories')) {
        await db.createCollection('categories');
        console.log('Created categories collection');
      }
      
      if (!collectionNames.includes('topics')) {
        await db.createCollection('topics');
        console.log('Created topics collection');
      }
    } catch (err) {
      console.log('Collection check/creation error:', err.message);
      // Continue despite error - collections might already exist
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('categories').deleteMany({});
    await db.collection('topics').deleteMany({});
    
    // Insert categories
    console.log('Inserting categories...');
    await db.collection('categories').insertMany(sampleCategories);
    
    // Insert topics
    console.log('Inserting topics...');
    await db.collection('topics').insertMany(sampleTopics);
    
    console.log('Database seeded successfully');
    
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedDatabase()
  .then(result => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
