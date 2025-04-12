/**
 * MongoDB schema for Event collection
 */
const eventSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "date", "description"],
      properties: {
        id: {
          bsonType: "string",
          description: "Unique identifier for the event"
        },
        date: {
          bsonType: "date",
          description: "Date when the event occurred"
        },
        description: {
          bsonType: "string",
          description: "Description of the event"
        },
        image_urls: {
          bsonType: "array",
          description: "URLs to images associated with the event",
          items: {
            bsonType: "string"
          }
        },
        related_events_ids: {
          bsonType: "array",
          description: "References to related events",
          items: {
            bsonType: "string"
          }
        },
        articles_ids: {
          bsonType: "array",
          description: "References to articles covering this event",
          items: {
            bsonType: "string"
          }
        },
        timeline: {
          bsonType: "object",
          description: "Timeline of sub-events or developments",
          properties: {
            events: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  date: {
                    bsonType: "date"
                  },
                  description: {
                    bsonType: "string"
                  },
                  event_id: {
                    bsonType: "string"
                  }
                }
              }
            }
          }
        },
        unread_count: {
          bsonType: "int",
          description: "Number of unread articles related to this event"
        },
        priority: {
          bsonType: "int",
          description: "Priority level for event recommendations"
        }
      }
    }
  }
};

module.exports = eventSchema;
