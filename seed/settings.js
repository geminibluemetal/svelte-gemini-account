// seed/settings.js
export const collectionName = 'settings';

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
