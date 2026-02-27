// seed/cash.js
export const collectionName = 'cash';

// Define indexes for better query performance
export const indexes = [
  { spec: { order_id: 1 } }, // Index for looking up cash entries by order
  { spec: { entry_type: 1 } }, // Index for filtering by income/expense
  { spec: { created_at: -1 } }, // Index for sorting by creation date
  { spec: { created_at: -1, entry_type: 1 } }, // Compound index for common queries
];

// Optional: Define MongoDB schema validation
export const validationRules = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['amount', 'entry_type'],
      properties: {
        order_id: {
          bsonType: ['objectId', 'null'],
          description: 'must be an ObjectId or null if not linked to an order',
        },
        amount: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a positive number and is required',
        },
        description: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null if not provided',
        },
        created_at: {
          bsonType: ['date', 'null'],
          description: 'must be a date or null',
        },
        entry_type: {
          enum: ['INCOME', 'EXPENSE'],
          description: 'must be either INCOME or EXPENSE and is required',
        },
        sign: {
          bsonType: 'int',
          minimum: -1,
          maximum: 1,
          description: 'must be -1, 0, or 1',
        },
      },
    },
  },
  level: 'strict',
  action: 'error',
};

// Seed data - empty array since this is a transactional table
// Cash entries will be created through the application
export const seedData = [];

// Note about relationships in MongoDB:
// The order_id field will reference the _id field from the orders collection
// MongoDB doesn't enforce foreign key constraints automatically,
// so this relationship needs to be maintained at the application level

// Example of what a cash document will look like when inserted by the app:
// {
//   _id: ObjectId("..."),
//   order_id: ObjectId("..."), // Reference to orders collection
//   amount: 1500.00,
//   description: "Payment for order #123",
//   created_at: new Date(),
//   entry_type: "INCOME",
//   sign: 1
// }
