// seed/orders.js
export const collectionName = 'orders';

// Seed data - empty array since this is a transactional table
// Orders will be created through the application
export const seedData = [];

// Example of what an order document will look like when inserted by the app:
// {
//   _id: ObjectId("..."),
//   orderNumber: 1001,
//   partyName: "M/S Construction Co",
//   address: "Vaniyambadi",
//   phone: "9876543210",
//   item: "20mm Metal",
//   totalQty: 500,
//   paymentAt: new Date("2024-01-15"),
//   amountType: "Credit",
//   amount: 45000,
//   advance: 10000,
//   discount: 500,
//   balance: 34500,
//   sign: false,
//   isOwnerOrder: false,
//   tracktorOnly: false,
//   deliveredQty: 200,
//   balanceQty: 300,
//   notes: "Delivery preferred in mornings",
//   status: "In Progress",
//   deliverySheetVerified: 0,
//   createdAt: new Date()
// }
