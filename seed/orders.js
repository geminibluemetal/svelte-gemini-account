// seed/orders.js
export const collectionName = 'orders';

// Define indexes for better query performance
export const indexes = [
  { spec: { order_number: 1 }, options: { unique: true } }, // Unique index on order number
  { spec: { party_name: 1 } }, // Index for filtering by party name
  { spec: { phone: 1 } }, // Index for searching by phone number
  { spec: { item: 1 } }, // Index for filtering by item
  { spec: { status: 1 } }, // Index for filtering by status
  { spec: { created_at: -1 } }, // Index for sorting by creation date
  { spec: { payment_at: -1 } }, // Index for sorting by payment date
  { spec: { status: 1, created_at: -1 } }, // Compound index for status + date queries
  { spec: { party_name: 1, created_at: -1 } }, // Compound index for party's orders by date
  { spec: { is_owner_order: 1 } }, // Index for filtering owner orders
  { spec: { tracktor_only: 1 } }, // Index for filtering tractor-only orders
];

// Optional: Define MongoDB schema validation
export const validationRules = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['order_number', 'item', 'total_qty', 'amount_type'],
      properties: {
        order_number: {
          bsonType: 'int',
          description: 'must be an integer and is required',
        },
        party_name: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        address: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        phone: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        item: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        total_qty: {
          bsonType: 'double',
          minimum: 0,
          description: 'must be a positive number and is required',
        },
        payment_at: {
          bsonType: ['date', 'null'],
          description: 'must be a date or null',
        },
        amount_type: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        amount: {
          bsonType: 'double',
          minimum: 0,
          description: 'must be a positive number',
        },
        advance: {
          bsonType: 'double',
          minimum: 0,
          description: 'must be a positive number',
        },
        discount: {
          bsonType: 'double',
          minimum: 0,
          description: 'must be a positive number',
        },
        balance: {
          bsonType: 'double',
          minimum: 0,
          description: 'must be a positive number',
        },
        sign: {
          bsonType: 'bool',
          description: 'must be a boolean',
        },
        is_owner_order: {
          bsonType: 'bool',
          description: 'must be a boolean',
        },
        tracktor_only: {
          bsonType: 'bool',
          description: 'must be a boolean',
        },
        delivered_qty: {
          bsonType: 'double',
          minimum: 0,
          description: 'must be a positive number',
        },
        balance_qty: {
          bsonType: 'double',
          minimum: 0,
          description: 'must be a positive number',
        },
        notes: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        status: {
          bsonType: 'string',
          description: 'must be a string',
        },
        delivery_sheet_verified: {
          bsonType: 'int',
          minimum: 0,
          maximum: 1,
          description: 'must be 0 or 1',
        },
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

// Seed data - empty array since this is a transactional table
// Orders will be created through the application
export const seedData = [];

// Example of what an order document will look like when inserted by the app:
// {
//   _id: ObjectId("..."),
//   order_number: 1001,
//   party_name: "M/S Construction Co",
//   address: "Vaniyambadi",
//   phone: "9876543210",
//   item: "20mm Metal",
//   total_qty: 500,
//   payment_at: new Date("2024-01-15"),
//   amount_type: "Credit",
//   amount: 45000,
//   advance: 10000,
//   discount: 500,
//   balance: 34500,
//   sign: false,
//   is_owner_order: false,
//   tracktor_only: false,
//   delivered_qty: 200,
//   balance_qty: 300,
//   notes: "Delivery preferred in mornings",
//   status: "In Progress",
//   delivery_sheet_verified: 0,
//   created_at: new Date()
// }
