// seed/orders.js
export const collectionName = 'orders';

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
