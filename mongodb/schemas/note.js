/**
 * MongoDB schema for Note collection
 */
const noteSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "content", "created_at", "reference_type", "reference_id"],
      properties: {
        id: {
          bsonType: "string",
          description: "Unique identifier for the note"
        },
        content: {
          bsonType: "string",
          description: "Content of the note"
        },
        created_at: {
          bsonType: "date",
          description: "Date when the note was created"
        },
        updated_at: {
          bsonType: "date",
          description: "Date when the note was last updated"
        },
        reference_type: {
          bsonType: "string",
          description: "Type of entity this note references (article, topic, category, event)",
          enum: ["article", "topic", "category", "event"]
        },
        reference_id: {
          bsonType: "string",
          description: "ID of the entity this note references"
        },
        tags: {
          bsonType: "array",
          description: "Tags for categorizing and filtering notes",
          items: {
            bsonType: "string"
          }
        },
        metadata: {
          bsonType: "object",
          description: "Additional metadata for the note"
        },
        priority: {
          bsonType: "int",
          description: "Priority level for the note"
        },
        is_archived: {
          bsonType: "bool",
          description: "Whether the note is archived"
        }
      }
    }
  }
};

module.exports = noteSchema;
