// seed/delivery.js
export const collectionName = 'delivery';

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
