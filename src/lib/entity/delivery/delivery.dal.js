import { calculateAmount } from '$lib/core/helper';
import db from '$lib/core/server/db';
import { fetchSingleAddressByName } from '../address/address.dal';
import { fetchSingleItemByName } from '../items/items.dal';
import { fetchSingleOrderByOrderNumber } from '../orders/order.dal';
import { examineStatusByQuantity } from '../orders/order.service';
import { fetchSinglePartyByName } from '../party/party.dal';

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
    data.is_cancelled ? 1 : 0,
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

const syncLedgerFromDelivery = (delivery) => {
  const num = (val) => Number(val) || 0;
  const isAc = delivery.amount_type_1 == 'AC' || delivery.amount_type_2 == 'AC';
  const party_name = delivery.party_name;
  const isCancelled = delivery.is_cancelled;
  let amount =
    (delivery.amount_type_1 === 'AC' ? num(delivery.amount_1) : 0) +
    (delivery.amount_type_2 === 'AC' ? num(delivery.amount_2) : 0);

  const address = fetchSingleAddressByName(delivery.address);
  const item = fetchSingleItemByName(delivery.delivery_item);

  if (!amount) {
    const amountResult = calculateAmount(address, item, delivery.delivery_quantity);
    if (amountResult.success) {
      amount = amountResult.data;
    } else {
      return amountResult;
    }
  }

  const statementDeleteQuery = `DELETE FROM party_statements WHERE delivery_id = ?`;
  const statementDelete = db.prepare(statementDeleteQuery);

  // Delete Existing Statement
  statementDelete.run(delivery.id);

  if (isCancelled || !isAc || !party_name) {
    return { success: true };
  }

  // Create New Statement
  const party = fetchSinglePartyByName(party_name);
  const statementCreateQuery = `
  INSERT INTO party_statements
    (
      party_id,
      delivery_id,
      amount_type,
      entry_type,
      amount,
      item,
      qty,
      vehicle,
      address,
      time,
      sign
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const statementCreate = db.prepare(statementCreateQuery);
  const data = [
    party.id,
    delivery.id,
    null,
    'DEBIT',
    amount,
    delivery.delivery_item,
    delivery.delivery_quantity,
    delivery.vehicle,
    delivery.address,
    delivery.delivery_time,
    delivery.sign
  ];
  const result = statementCreate.run(data);
  if (result?.changes) {
    return { success: true };
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
      amount_1 = COALESCE(?, amount_1),
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
    data.amount_type_1 ? data.amount_type_1 : oldDelivery.amount_type_1 == 'AC' ? '' : null, // TODO
    data.amount_type_1 == 'AC' ? 0 : null, // TODO
    data.is_cancelled ? 1 : 0,
    id
  ];
  const stmt = db.prepare(query);
  const result = stmt.run(params);

  if (!result.changes) {
    return { message: 'Delivery Not Updated', ok: false };
  }

  const newDelivery = fetchDeliveryById(id);

  // Additional Things
  // 1) Update Orders
  syncOrderFromDelivery(oldDelivery, newDelivery);
  // 2) Update Ledger
  const syncResult = syncLedgerFromDelivery(newDelivery);
  return syncResult;
}

export function updateDeliveryAmountById(data, id) {
  const query = `
    UPDATE delivery SET
      amount_time = COALESCE(?, amount_time),
      amount_type_1 = COALESCE(?, amount_type_1),
      amount_1 = COALESCE(?, amount_1),
      amount_type_2 = COALESCE(?, amount_type_2),
      amount_2 = COALESCE(?, amount_2)
    WHERE id = ?
  `;
  const amount_time =
    data.amount_1 || data.amount_type_1 || data.amount_2 || data.amount_type_2
      ? new Date().toISOString()
      : '';
  const params = [
    amount_time,
    data.amount_type_1 !== undefined ? data.amount_type_1 : null,
    data.amount_1 !== undefined ? data.amount_1 : null,
    data.amount_type_2 !== undefined ? data.amount_type_2 : null,
    data.amount_2 !== undefined ? data.amount_2 : null,
    id
  ];

  const stmt = db.prepare(query);
  const result = stmt.run(params);
  if (!result?.changes) {
    return { message: 'Delivery Amount not Updated', ok: false };
  }

  const delivery = fetchDeliveryById(id);
  const syncResult = syncLedgerFromDelivery(delivery);
  return syncResult;
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

    db.prepare(
      `
      UPDATE party_statements
      SET sign = ?
      WHERE delivery_id = ?
    `
    ).run(value, targetId);

    // 3. Update the sign column in the delivery table
    // (Assuming tableName is 'delivery' based on your context)
    return db.prepare(`UPDATE delivery SET sign = ? WHERE id = ?`).run(value, targetId);
  });

  // Execute the transaction
  return performUpdate(id, newValue);
}

export function markDeliveryById(id, value) {
  db.prepare(`UPDATE delivery SET has_mark = ? WHERE id = ?`).run(value, id);
}

export function deleteTokenById(id) {
  const query = `DELETE FROM delivery WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(id);
}

export function getAllDeliveryCash(date) {
  const query = `
  SELECT
      id,
      'DS-' || serial AS serial,
      amount_time AS time,
      TRIM(
          COALESCE(NULLIF(party_name, ''), '') ||
          CASE WHEN NULLIF(party_name, '') IS NOT NULL AND NULLIF(address, '') IS NOT NULL THEN ', ' ELSE '' END ||
          COALESCE(NULLIF(address, ''), '')
      ) AS description,
      (
        CASE WHEN amount_type_1 = 'CP' THEN amount_1 ELSE 0 END +
        CASE WHEN amount_type_2 = 'CP' THEN amount_2 ELSE 0 END
      ) AS amount,
      sign,
      created_at,
      'DELIVERY' AS source
  FROM delivery
  WHERE
      DATE(amount_time) = ?
      AND (
          (amount_type_1 = 'CP' AND amount_1 != 0)
          OR
          (amount_type_2 = 'CP' AND amount_2 != 0)
      );
  `;
  const stmt = db.prepare(query);
  return stmt.all(date);
}
