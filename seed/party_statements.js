// seed/party_statements.js
export const collectionName = 'party_statements';

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
