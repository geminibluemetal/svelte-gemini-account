import db from '$lib/core/server/db';
import { fetchSingleOrderByOrderNumber } from '../orders/order.dal';
import { examineStatusByQuantity } from '../orders/order.service';

const tableName = 'delivery'; // Token also uses delivery table

export function fetchAllDeliveryByDate(date) {
  const query = `SELECT * FROM ${tableName} WHERE DATE(created_at) = '${date}';`;
  const stat = db.prepare(query);
  db.pragma('wal_checkpoint(TRUNCATE)');
  return stat.all();
}

export function fetchDeliveryById(id) {
  const query = `SELECT * FROM ${tableName} WHERE id = '${id}';`;
  const stat = db.prepare(query);
  return stat.get();
}

export function fetchLastSerialByDate(date) {
  const query = `
    SELECT MAX(serial) as last_serial
    FROM delivery
    WHERE DATE(created_at) = ?;
  `;
  const stat = db.prepare(query);
  const result = stat.get(date); // Use get() for single result
  return result ? result.last_serial : 0;
}

export function insertToken(data) {
  // Assuming your table has DEFAULT values for some columns
  const query = `
    INSERT INTO delivery (
      party_name,
      vehicle,
      token_item,
      token_quantity,
      is_cancelled,
      serial,
      token_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.party_name || null,
    data.vehicle || '',
    data.token_item || '',
    data.token_quantity || 0,
    data.is_cancelled ? 1 : 0,
    data.serial || 0,
    data.token_time || ''
  ];

  const stmt = db.prepare(query);
  return stmt.run(params);
}

export function updateTokenById(data, id) {
  // Define all possible fields based on table schema
  const query = `
    UPDATE delivery SET
      party_name = COALESCE(?, party_name),
      token_item = COALESCE(?, token_item),
      token_quantity = COALESCE(?, token_quantity),
      vehicle = COALESCE(?, vehicle),
      is_cancelled = COALESCE(?, is_cancelled)
    WHERE id = ?
  `;

  const params = [
    data.party_name !== undefined ? data.party_name : null,
    data.token_item !== undefined ? data.token_item : null,
    data.token_quantity !== undefined ? data.token_quantity : null,
    data.vehicle !== undefined ? data.vehicle : null,
    data.is_cancelled !== undefined ? (data.is_cancelled ? 1 : 0) : null,
    id
  ];

  const stmt = db.prepare(query);
  return stmt.run(params);
}

const syncOrderFromDelivery = (oldDelivery, newDelivery) => {
  const num = (val) => Number(val) || 0;
  const query = `
    UPDATE orders
    SET
      delivered_qty = ?,
      balance_qty = ?,
      status = ?,
      delivery_sheet_verified = ?
    WHERE order_number = ?
  `;
  const orderUpdates = db.prepare(query);
  const updates = {};

  // Updates Old Order
  const oldOrder = fetchSingleOrderByOrderNumber(oldDelivery.order_number);
  if (oldOrder) {
    updates.delivered_qty = num(oldOrder.delivered_qty) - num(oldDelivery.delivery_quantity);
    updates.balance_qty = num(oldOrder.total_qty) - num(updates.delivered_qty);
    updates.status = examineStatusByQuantity(
      num(oldOrder.total_qty),
      num(updates.delivered_qty),
      num(updates.balance_qty)
    );
    updates.delivery_sheet_verified = oldDelivery.sign
      ? num(oldOrder.delivery_sheet_verified) - 1
      : oldOrder.delivery_sheet_verified;
    updates.order_number = oldOrder.order_number;

    orderUpdates.run(
      updates.delivered_qty || 0,
      updates.balance_qty || 0,
      updates.status || 'New',
      updates.delivery_sheet_verified || 0,
      updates.order_number
    );
  }

  // Updates New Order
  const newOrder = fetchSingleOrderByOrderNumber(newDelivery.order_number);
  if (newOrder) {
    updates.delivered_qty = num(newOrder.delivered_qty) + num(newDelivery.delivery_quantity);
    updates.balance_qty = num(newOrder.total_qty) - num(updates.delivered_qty);
    updates.status = examineStatusByQuantity(
      num(newOrder.total_qty),
      num(updates.delivered_qty),
      num(updates.balance_qty)
    );
    updates.delivery_sheet_verified = newDelivery.sign
      ? num(newOrder.delivery_sheet_verified) + 1
      : newOrder.delivery_sheet_verified;
    updates.order_number = newOrder.order_number;

    orderUpdates.run(
      updates.delivered_qty || 0,
      updates.balance_qty || 0,
      updates.status || 'New',
      updates.delivery_sheet_verified || 0,
      updates.order_number
    );
  }
};

export function updateDeliveryById(data, id) {
  const oldDelivery = fetchDeliveryById(id);

  const query = `
    UPDATE delivery SET
      order_number = COALESCE(?, order_number),
      party_name = COALESCE(?, party_name),
      address = COALESCE(?, address),
      delivery_time = CASE
        WHEN delivery_time IS NULL OR delivery_time = ''
        THEN ?
        ELSE delivery_time
      END,
      delivery_item = COALESCE(?, delivery_item),
      delivery_quantity = COALESCE(?, delivery_quantity),
      amount_type_1 = COALESCE(?, amount_type_1),
      is_cancelled = COALESCE(?, is_cancelled)
    WHERE id = ?
  `;

  const params = [
    data.order_number !== undefined ? data.order_number : null,
    data.party_name !== undefined ? data.party_name : null,
    data.address !== undefined ? data.address : null,
    data.delivery_time !== undefined ? data.delivery_time : null,
    data.delivery_item !== undefined ? data.delivery_item : null,
    data.delivery_quantity !== undefined ? data.delivery_quantity : null,
    data.amount_type_1 ? data.amount_type_1 : null, // TODO
    data.is_cancelled !== undefined ? (data.is_cancelled ? 1 : 0) : null,
    id
  ];
  const stmt = db.prepare(query);
  const result = stmt.run(params);

  if (!result.changes) {
    return { message: 'Delivery Not Updated', ok: false };
  }

  const newDelivery = fetchDeliveryById(id);

  // Additional Things
  // 1) Updaste Orders
  syncOrderFromDelivery(oldDelivery, newDelivery);
  return { success: true };
}

export function updateDeliveryAmountById(data, id) {
  const query = `
    UPDATE delivery SET
      amount_type_1 = COALESCE(?, amount_type_1),
      amount_1 = COALESCE(?, amount_1),
      amount_type_2 = COALESCE(?, amount_type_2),
      amount_2 = COALESCE(?, amount_2)
    WHERE id = ?
  `;

  const params = [
    data.amount_type_1 !== undefined ? data.amount_type_1 : null,
    data.amount_1 !== undefined ? data.amount_1 : null,
    data.amount_type_2 !== undefined ? data.amount_type_2 : null,
    data.amount_2 !== undefined ? data.amount_2 : null,
    id
  ];

  const stmt = db.prepare(query);
  return stmt.run(params);
}

export function signDelivery(id, newValue) {
  // Define the transaction logic
  const performUpdate = db.transaction((targetId, value) => {
    // 1. Get the order number from the delivery table
    const row = db.prepare('SELECT order_number FROM delivery WHERE id = ?').get(targetId);

    if (!row) {
      throw new Error(`Delivery record with ID ${targetId} not found.`);
    }

    // 2. Update the counter in the orders table
    // adjustment is 1 if newValue is truthy, -1 if falsy
    const adjustment = value ? 1 : -1;
    db.prepare(
      `
      UPDATE orders
      SET delivery_sheet_verified = delivery_sheet_verified + ?
      WHERE order_number = ?
    `
    ).run(adjustment, row.order_number);

    // 3. Update the sign column in the delivery table
    // (Assuming tableName is 'delivery' based on your context)
    return db.prepare(`UPDATE delivery SET sign = ? WHERE id = ?`).run(value, targetId);
  });

  // Execute the transaction
  return performUpdate(id, newValue);
}

export function deleteTokenById(id) {
  const query = `DELETE FROM delivery WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(id);
}
