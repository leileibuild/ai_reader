/**
 * MongoDB schema for Article collection
 */
const articleSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "title", "published_date", "url"],
      properties: {
        id: {
          bsonType: "string",
          description: "Unique identifier for the article"
        },
        title: {
          bsonType: "string",
          description: "Title of the article"
        },
        publisher: {
          bsonType: "string",
          description: "Publisher of the article"
        },
        author: {
          bsonType: "string",
          description: "Author of the article"
        },
        published_date: {
          bsonType: "date",
          description: "Publication date of the article"
        },
        url: {
          bsonType: "string",
          description: "URL to the original article"
        },
        summary: {
          bsonType: "string",
          description: "Summary or excerpt of the article"
        },
        image_urls: {
          bsonType: "array",
          description: "URLs to images associated with the article",
          items: {
            bsonType: "string"
          }
        },
        keywords: {
          bsonType: "array",
          description: "Keywords associated with the article",
          items: {
            bsonType: "string"
          }
        },
        topics_ids: {
          bsonType: "array",
          description: "References to associated topics",
          items: {
            bsonType: "string"
          }
        },
        categories_ids: {
          bsonType: "array",
          description: "References to associated categories",
          items: {
            bsonType: "string"
          }
        },
        related_topics_ids: {
          bsonType: "array",
          description: "References to related topics",
          items: {
            bsonType: "string"
          }
        },
        events_ids: {
          bsonType: "array",
          description: "References to related events",
          items: {
            bsonType: "string"
          }
        },
        topics_scores: {
          bsonType: "double",
          description: "Relevance scores for related topics"
        },
        events_scores: {
          bsonType: "double",
          description: "Relevance scores for related events"
        },
        original_article: {
          bsonType: "object",
          description: "Original article content and metadata"
        },
        unread_count: {
          bsonType: "int",
          description: "Number of times the article has been viewed but not completely read"
        },
        priority: {
          bsonType: "int",
          description: "Priority level for reading recommendations"
        }
      }
    }
  }
};

module.exports = articleSchema;
