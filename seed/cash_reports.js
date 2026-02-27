// seed/cash_reports.js
export const collectionName = 'cash_reports';

// Define indexes for better query performance
export const indexes = [
  { spec: { created_at: -1 } }, // Index for sorting by creation date (descending)
];

// Optional: Define MongoDB schema validation
export const validationRules = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      properties: {
        created_at: {
          bsonType: ['date', 'null'],
          description: 'must be a date or null',
        },
      },
    },
  },
  level: 'strict',
  action: 'error',
};

// Seed data - empty array since no initial data is needed
// Each document will get an _id and created_at automatically
export const seedData = [];

// No unique field needed since we're not inserting any data
// export const uniqueField = null;

// Note: This collection will be created but left empty.
// Documents will be added later through the application when cash reports are generated.
