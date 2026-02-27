// seed/delivery.js
export const collectionName = 'delivery';

// Define indexes for better query performance
export const indexes = [
  { spec: { serial: 1 }, options: { unique: true } }, // Unique index on serial number
  { spec: { order_number: 1 } }, // Index for looking up by order number
  { spec: { party_name: 1 } }, // Index for filtering by party name
  { spec: { vehicle: 1 } }, // Index for filtering by vehicle
  { spec: { delivered_at: -1 } }, // Index for sorting by delivery date
  { spec: { is_cancelled: 1 } }, // Index for filtering cancelled deliveries
  { spec: { party_name: 1, delivered_at: -1 } }, // Compound index for party's deliveries by date
  { spec: { vehicle: 1, delivered_at: -1 } }, // Compound index for vehicle's deliveries by date
];

// Optional: Define MongoDB schema validation
export const validationRules = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['serial', 'token_item', 'token_quantity', 'vehicle'],
      properties: {
        serial: {
          bsonType: 'int',
          description: 'must be an integer and is required',
        },
        delivered_at: {
          bsonType: ['date', 'null'],
          description: 'must be a date or null',
        },
        payment_at: {
          bsonType: ['date', 'null'],
          description: 'must be a date or null',
        },
        order_number: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        party_name: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        address: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        token_item: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        token_quantity: {
          bsonType: 'double',
          minimum: 0,
          description: 'must be a positive number and is required',
        },
        delivery_item: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        delivery_quantity: {
          bsonType: ['double', 'null'],
          minimum: 0,
          description: 'must be a positive number or null',
        },
        amount_type_1: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        amount_type_2: {
          bsonType: ['string', 'null'],
          description: 'must be a string or null',
        },
        amount_1: {
          bsonType: ['double', 'null'],
          minimum: 0,
          description: 'must be a positive number or null',
        },
        amount_2: {
          bsonType: ['double', 'null'],
          minimum: 0,
          description: 'must be a positive number or null',
        },
        sign: {
          bsonType: 'bool',
          description: 'must be a boolean',
        },
        has_mark: {
          bsonType: 'bool',
          description: 'must be a boolean',
        },
        vehicle: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        is_cancelled: {
          bsonType: 'bool',
          description: 'must be a boolean',
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
// Delivery entries will be created through the application
export const seedData = [];

// Example of what a delivery document will look like when inserted by the app:
// {
//   _id: ObjectId("..."),
//   serial: 1001,
//   delivered_at: new Date("2024-01-15T10:30:00"),
//   payment_at: new Date("2024-01-15T16:45:00"),
//   order_number: "ORD-2024-001",
//   party_name: "M/S Construction Co",
//   address: "Vaniyambadi",
//   token_item: "20mm Metal",
//   token_quantity: 500,
//   delivery_item: "20mm Metal",
//   delivery_quantity: 480,
//   amount_type_1: "Material Cost",
//   amount_type_2: "Transport",
//   amount_1: 45000,
//   amount_2: 5000,
//   sign: false,
//   has_mark: true,
//   vehicle: "TN23 AB 1234",
//   is_cancelled: false,
//   created_at: new Date()
// }
