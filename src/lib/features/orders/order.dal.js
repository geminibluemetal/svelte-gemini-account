import { connectDB } from '$lib/core/server/mongodb';
import { ObjectId } from 'mongodb';

const collectionName = 'orders';

export async function fetchAllOrders() {
  const db = await connectDB();
  const orders = await db.collection(collectionName).find({}).toArray();
  return orders;
}

export async function fetchSingleOrderByOrderNumber(order_number) {
  const db = await connectDB();
  const order = await db.collection(collectionName).findOne({ order_number: order_number });
  return order;
}

export async function fetchOrdersByStatus(statusArray) {
  const db = await connectDB();
  const orders = await db
    .collection(collectionName)
    .find({ status: { $in: statusArray } })
    .toArray();
  return orders;
}

export async function fetchSingleOrderById(id) {
  const db = await connectDB();
  const order = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
  return order;
}

export async function updateSingleOrderColumn(id, columnName, newValue) {
  const db = await connectDB();
  const updateData = {
    $set: {
      [columnName]: newValue,
    },
  };
  const result = await db
    .collection(collectionName)
    .updateOne({ _id: new ObjectId(id) }, updateData);

  return result;
}

export async function insertOrder(data) {
  const orderData = {
    order_number: Number(data.order_number),
    party_name: data.party_name || null,
    address: data.address || null,
    phone: data.phone || null,
    item: data.item,
    total_qty: Number(data.total_qty) || 0,
    payment_at: data.amount_type === 'Cash' && Number(data.amount) ? new Date() : null,
    amount_type: data.amount_type,
    amount: Number(data.amount) || 0,
    advance: Number(data.advance) || 0,
    discount: Number(data.discount) || 0,
    balance: Number(data.balance) || 0,
    sign: Boolean(data.sign),
    is_owner_order: Boolean(data.is_owner_order),
    tracktor_only: Boolean(data.tracktor_only),
    delivered_qty: Number(data.delivered_qty) || 0,
    balance_qty: Number(data.balance_qty) || 0,
    notes: data.notes || '',
    status: data.status || 'New',
    delivery_sheet_verified: data.delivery_sheet_verified ? 1 : 0,
    created_at: data.date ? new Date(data.date) : new Date(),
  };

  console.log(orderData);
  const db = await connectDB();
  const result = await db.collection(collectionName).insertOne(orderData);
  return result;
}

export async function updateOrderById(id, data) {
  const updateData = {
    $set: {
      party_name: data.party_name,
      address: data.address || null,
      phone: data.phone || null,
      item: data.item,
      total_qty: parseFloat(data.total_qty) || 0,
      payment_at: data.amount_type === 'Cash' && parseFloat(data.amount) ? new Date() : null,
      amount_type: data.amount_type,
      amount: parseFloat(data.amount) || 0,
      advance: parseFloat(data.advance) || 0,
      discount: parseFloat(data.discount) || 0,
      balance: parseFloat(data.balance) || 0,
      balance_qty: parseFloat(data.balance_qty) || 0,
      is_owner_order: Boolean(data.is_owner_order),
      tracktor_only: Boolean(data.tracktor_only),
      status: data.status || 'New',
      notes: data.notes || '',
    },
  };
  const db = await connectDB();
  const result = await db
    .collection(collectionName)
    .updateOne({ _id: new ObjectId(id) }, updateData);
  return result;
}

export async function deleteOrderById(id) {
  const db = await connectDB();
  const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  return result;
}

export async function deleteOrdersByStatus(statusArray) {
  const db = await connectDB();
  const result = await db.collection(collectionName).deleteMany({
    status: { $in: statusArray },
  });
  return result;
}
