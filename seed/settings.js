// seed/settings.js
export const collectionName = 'settings';

// Define indexes for better query performance
export const indexes = [
  // Since this is a single-document collection, we don't need many indexes
  // But we'll add an index on _id which is automatic
];

// Optional: Define MongoDB schema validation
export const validationRules = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['last_order_number'],
      properties: {
        last_order_number: {
          bsonType: 'int',
          minimum: 0,
          description: 'must be a non-negative integer and is required',
        },
        created_at: {
          bsonType: ['date', 'null'],
          description: 'must be a date or null',
        },
        updated_at: {
          bsonType: ['date', 'null'],
          description: 'must be a date or null',
        },
      },
    },
  },
  level: 'strict',
  action: 'error',
};

// Seed data - converted from SQL format to MongoDB document format
export const seedData = [
  {
    last_order_number: 0,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Specify a unique field - but there's only one document, so we don't need this
// export const uniqueField = null;

// Note about MongoDB approach for settings:
// Unlike SQLite which stores settings as a row in a table,
// MongoDB will store settings as a single document in the collection.
// This document can be updated as the last_order_number increases.

// Example of updating the settings document:
// db.settings.updateOne(
//   {}, // empty filter matches the single document
//   { $set: { last_order_number: 123, updated_at: new Date() } }
// );

// To retrieve the current settings:
// const settings = await db.settings.findOne({});
