/**
 * MongoDB schema for Category collection
 */
const categorySchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name"],
      properties: {
        id: {
          bsonType: "string",
          description: "Unique identifier for the category"
        },
        name: {
          bsonType: "string",
          description: "Name of the category"
        },
        description: {
          bsonType: "string",
          description: "Description of the category"
        },
        image_urls: {
          bsonType: "array",
          description: "URLs to images associated with the category",
          items: {
            bsonType: "string"
          }
        },
        keywords: {
          bsonType: "array",
          description: "Keywords associated with the category",
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
        subcategories: {
          bsonType: "array",
          description: "List of subcategories within this category",
          items: {
            bsonType: "object",
            required: ["id", "name"],
            properties: {
              id: {
                bsonType: "string",
                description: "Unique identifier for the subcategory"
              },
              name: {
                bsonType: "string",
                description: "Name of the subcategory"
              },
              description: {
                bsonType: "string",
                description: "Description of the subcategory"
              },
              keywords: {
                bsonType: "array",
                description: "Keywords associated with the subcategory",
                items: {
                  bsonType: "string"
                }
              },
              image_urls: {
                bsonType: "array",
                description: "URLs to images associated with the subcategory",
                items: {
                  bsonType: "string"
                }
              }
            }
          }
        },
        unread_count: {
          bsonType: "int",
          description: "Number of unread articles in this category"
        },
        priority: {
          bsonType: "int",
          description: "Priority level for category recommendations"
        }
      }
    }
  }
};

module.exports = categorySchema;
