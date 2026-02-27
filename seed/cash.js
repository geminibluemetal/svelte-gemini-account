// seed/cash.js
export const collectionName = 'cash';

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
