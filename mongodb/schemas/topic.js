/**
 * MongoDB schema for Topic collection
 */
const topicSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name"],
      properties: {
        id: {
          bsonType: "string",
          description: "Unique identifier for the topic"
        },
        name: {
          bsonType: "string",
          description: "Name of the topic"
        },
        description: {
          bsonType: "string",
          description: "Description of the topic"
        },
        image_urls: {
          bsonType: "array",
          description: "URLs to images associated with the topic",
          items: {
            bsonType: "string"
          }
        },
        keywords: {
          bsonType: "array",
          description: "Keywords associated with the topic",
          items: {
            bsonType: "string"
          }
        },
        articles_ids: {
          bsonType: "array",
          description: "References to associated articles",
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
        timeline: {
          bsonType: "object",
          description: "Timeline of events related to this topic",
          properties: {
            events: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        unread_count: {
          bsonType: "int",
          description: "Number of unread articles related to this topic"
        },
        priority: {
          bsonType: "int",
          description: "Priority level for topic recommendations"
        }
      }
    }
  }
};

module.exports = topicSchema;
