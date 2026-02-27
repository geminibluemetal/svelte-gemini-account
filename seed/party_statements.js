// seed/party_statements.js
export const collectionName = 'party_statements';

// Define indexes for better query performance
export const indexes = [
  { spec: { party_id: 1 } }, // Index for looking up statements by party
  { spec: { delivery_id: 1 } }, // Index for looking up statements by delivery
  { spec: { entry_type: 1 } }, // Index for filtering by debit/credit
  { spec: { created_at: -1 } }, // Index for sorting by creation date
  { spec: { party_id: 1, created_at: -1 } }, // Compound index for party's statements by date
  { spec: { amount_type: 1 } }, // Index for filtering by amount type
  { spec: { vehicle: 1 } }, // Index for filtering by vehicle
];

// Optional: Define MongoDB schema validation
export const validationRules = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['party_id', 'entry_type', 'amount'],
      properties: {
        party_id: {
          bsonType: 'objectId',
          description: 'must be an ObjectId referencing a party and is required',
        },
        delivery_id: {
          bsonType: ['objectId', 'null'],
          description: 'must be an ObjectId referencing a delivery or null',
        },
        amount_type: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        entry_type: {
          enum: ['DEBIT', 'CREDIT'],
          description: 'must be either DEBIT or CREDIT and is required',
        },
        amount: {
          bsonType: 'double',
          minimum: 0,
          description: 'must be a positive number and is required',
        },
        item: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        qty: {
          bsonType: ['double', 'null'],
          minimum: 0,
          description: 'must be a positive number or null',
        },
        vehicle: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        address: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        created_at: {
          bsonType: ['date', 'null'],
          description: 'must be a date or null',
        },
        sign: {
          bsonType: 'int',
          minimum: 0,
          maximum: 1,
          description: 'must be 0 or 1',
        },
      },
    },
  },
  level: 'strict',
  action: 'error',
};

// Seed data - empty array since this is a transactional table
// Party statements will be created through the application
export const seedData = [];

// Example of what a party statement document will look like when inserted by the app:
// {
//   _id: ObjectId("..."),
//   party_id: ObjectId("507f1f77bcf86cd799439011"), // Reference to parties collection
//   delivery_id: ObjectId("507f1f77bcf86cd799439012"), // Reference to deliveries collection
//   amount_type: "Material Cost",
//   entry_type: "DEBIT",
//   amount: 5000.00,
//   item: "20mm Metal",
//   qty: 100.00,
//   vehicle: "TN23 AB 1234",
//   address: "Vaniyambadi",
//   created_at: new Date(),
//   sign: 1
// }

// Note about relationships in MongoDB:
// - party_id references the _id field from the parties collection
// - delivery_id references the _id field from the deliveries collection
// MongoDB doesn't enforce foreign key constraints automatically,
// so these relationships need to be maintained at the application level
