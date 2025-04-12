/**
 * Data Service for the News Reader Knowledge Graph
 * 
 * This module handles fetching data from the API and transforming it
 * into the format required by the knowledge graph visualization.
 */
class DataService {
  constructor() {
    // Base API URL - adjust based on your deployment
    this.apiBaseUrl = '/api';
  }

  /**
   * Fetch all categories with their subcategories and topics
   * @returns {Promise} Promise resolving to categorized data structure
   */
  async fetchKnowledgeGraphData() {
    try {
      console.log('Fetching knowledge graph data from API...');
      
      // Fetch categories, including subcategories
      const categories = await this.fetchCategories();
      console.log('Categories fetched successfully:', categories.length, 'categories');
      
      // Fetch all topics
      const topics = await this.fetchTopics();
      console.log('Topics fetched successfully:', topics.length, 'topics');
      
      // Validate data structure
      if (!Array.isArray(categories) || !Array.isArray(topics)) {
        console.error('Invalid data structure:', { 
          categoriesIsArray: Array.isArray(categories),
          topicsIsArray: Array.isArray(topics)
        });
        
        throw new Error('Invalid data structure returned from API');
      }
      
      // Ensure each category has an id and name
      const validCategories = categories.filter(category => {
        if (!category || typeof category !== 'object') {
          console.warn('Skipping invalid category object:', category);
          return false;
        }
        
        if (!category.id) {
          console.warn('Skipping category without ID:', category);
          return false;
        }
        
        if (!category.name) {
          console.warn('Skipping category without name:', category.id);
          return false;
        }
        
        // Process subcategories if present
        if (category.subcategories && Array.isArray(category.subcategories)) {
          category.subcategories = category.subcategories.filter(subcat => {
            if (!subcat || !subcat.id || !subcat.name) {
              console.warn(`Skipping invalid subcategory in category ${category.name}:`, subcat);
              return false;
            }
            return true;
          });
        }
        
        return true;
      });
      
      if (validCategories.length < categories.length) {
        console.warn(`Filtered out ${categories.length - validCategories.length} invalid categories`);
      }
      
      // Ensure each topic has id, name, and valid categoryIds
      const validTopics = topics.filter(topic => {
        if (!topic || typeof topic !== 'object') {
          console.warn('Skipping invalid topic object:', topic);
          return false;
        }
        
        if (!topic.id) {
          console.warn('Skipping topic without ID:', topic);
          return false;
        }
        
        if (!topic.name) {
          console.warn('Skipping topic without name:', topic.id);
          return false;
        }
        
        // Ensure topic has categoryIds array
        if (!topic.categoryIds) {
          // Create categoryIds array if missing
          console.warn(`Topic ${topic.name} missing categoryIds, creating empty array`);
          topic.categoryIds = [];
          
          // Try to find related categories from the sample data structure
          validCategories.forEach(category => {
            if (category.topics_ids && Array.isArray(category.topics_ids) && 
                category.topics_ids.includes(topic.id)) {
              topic.categoryIds.push(category.id);
            }
            
            // Check subcategories
            if (category.subcategories && Array.isArray(category.subcategories)) {
              category.subcategories.forEach(subcat => {
                if (subcat.topics && Array.isArray(subcat.topics)) {
                  if (subcat.topics.some(t => t.id === topic.id)) {
                    topic.categoryIds.push(subcat.id);
                  }
                }
              });
            }
          });
        }
        
        return true;
      });
      
      if (validTopics.length < topics.length) {
        console.warn(`Filtered out ${topics.length - validTopics.length} invalid topics`);
      }
      
      // Log data sample for debugging
      console.log('Processed data sample:', {
        categoriesSample: validCategories.slice(0, 1),
        topicsSample: validTopics.slice(0, 1),
        categoryCount: validCategories.length,
        topicCount: validTopics.length
      });
      
      // Combine the data for the graph structure
      const data = {
        categories: validCategories,
        topics: validTopics
      };
      
      console.log('Knowledge graph data prepared successfully');
      return data;
    } catch (error) {
      console.error('Error fetching knowledge graph data:', error);
      // For demo purposes, fallback to sample data if the API fails
      return this.getSampleData();
    }
  }

  /**
   * Fetch all categories from the API
   */
  async fetchCategories() {
    try {
      console.log('Fetching categories from API...');
      const response = await fetch(`${this.apiBaseUrl}/entities/categories`);
      console.log('API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('API categories response data:', responseData);
      
      // Extract categories array from the response structure
      if (responseData && responseData.categories) {
        return responseData.categories;
      } else {
        console.error('Unexpected API response format, no categories array found');
        return [];
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return empty array or throw error based on your error handling policy
      throw error;
    }
  }

  /**
   * Fetch all topics from the API
   */
  async fetchTopics() {
    try {
      console.log('Fetching topics from API...');
      const response = await fetch(`${this.apiBaseUrl}/entities/topics`);
      console.log('API topics response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('API topics response data:', responseData);
      
      // Extract topics array from the response structure
      if (responseData && responseData.topics) {
        console.log(`Successfully retrieved ${responseData.topics.length} topics`);
        return responseData.topics;
      } else {
        console.error('Unexpected API response format, no topics array found');
        return [];
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }

  /**
   * Get sample data for development and testing
   * This mimics the structure of the expected API response
   */
  getSampleData() {
    // Sample categories with subcategories
    const categories = [
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
            topics: [
              {
                id: 'topic1',
                name: 'Machine Learning',
                description: 'Statistical techniques enabling computers to improve based on experience',
                keywords: ['algorithms', 'neural networks', 'deep learning'],
                unread_count: 3
              },
              {
                id: 'topic2',
                name: 'Natural Language Processing',
                description: 'Processing and analyzing human language with AI',
                keywords: ['NLP', 'text analysis', 'language models'],
                unread_count: 2,
                related_topics_ids: ['topic1']
              }
            ]
          },
          {
            id: 'subcat2',
            name: 'Cybersecurity',
            description: 'Digital security, threats, and protective measures',
            keywords: ['security', 'hacking', 'privacy'],
            unread_count: 7,
            topics: [
              {
                id: 'topic3',
                name: 'Data Privacy',
                description: 'Protecting personal and sensitive information',
                keywords: ['privacy', 'data protection', 'GDPR'],
                unread_count: 4,
                related_topics_ids: ['topic8']
              }
            ]
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
            topics: [
              {
                id: 'topic5',
                name: 'Stock Market',
                description: 'News and analysis about equity markets',
                keywords: ['stocks', 'equities', 'trading'],
                unread_count: 2
              }
            ]
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
            topics: [
              {
                id: 'topic8',
                name: 'Diplomacy',
                description: 'International dialogue and negotiation between nations',
                keywords: ['international relations', 'treaties', 'negotiations'],
                unread_count: 3,
                related_topics_ids: ['topic9']
              },
              {
                id: 'topic9',
                name: 'Trade Agreements',
                description: 'International trade policies and economic partnerships',
                keywords: ['trade', 'tariffs', 'economic cooperation'],
                unread_count: 3,
                related_topics_ids: ['topic5', 'topic8']
              }
            ]
          }
        ]
      }
    ];

    // All topics from all categories and subcategories
    const topics = [
      {
        id: 'topic1',
        name: 'Machine Learning',
        description: 'Statistical techniques enabling computers to improve based on experience',
        keywords: ['algorithms', 'neural networks', 'deep learning'],
        unread_count: 3,
        related_topics_ids: ['topic2']
      },
      {
        id: 'topic2',
        name: 'Natural Language Processing',
        description: 'Processing and analyzing human language with AI',
        keywords: ['NLP', 'text analysis', 'language models'],
        unread_count: 2,
        related_topics_ids: ['topic1']
      },
      {
        id: 'topic3',
        name: 'Data Privacy',
        description: 'Protecting personal and sensitive information',
        keywords: ['privacy', 'data protection', 'GDPR'],
        unread_count: 4,
        related_topics_ids: ['topic8']
      },
      {
        id: 'topic4',
        name: 'Cloud Computing',
        description: 'On-demand availability of computer system resources',
        keywords: ['cloud', 'SaaS', 'distributed computing'],
        unread_count: 1,
        related_topics_ids: []
      },
      {
        id: 'topic5',
        name: 'Stock Market',
        description: 'News and analysis about equity markets',
        keywords: ['stocks', 'equities', 'trading'],
        unread_count: 2,
        related_topics_ids: ['topic9']
      },
      {
        id: 'topic6',
        name: 'Startups',
        description: 'Emerging companies and entrepreneurship',
        keywords: ['entrepreneurship', 'venture capital', 'innovation'],
        unread_count: 3,
        related_topics_ids: []
      },
      {
        id: 'topic8',
        name: 'Diplomacy',
        description: 'International dialogue and negotiation between nations',
        keywords: ['international relations', 'treaties', 'negotiations'],
        unread_count: 3,
        related_topics_ids: ['topic9', 'topic3']
      },
      {
        id: 'topic9',
        name: 'Trade Agreements',
        description: 'International trade policies and economic partnerships',
        keywords: ['trade', 'tariffs', 'economic cooperation'],
        unread_count: 3,
        related_topics_ids: ['topic5', 'topic8']
      }
    ];

    return { categories, topics };
  }
}
