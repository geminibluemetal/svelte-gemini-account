import db from '$lib/core/server/db';

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
      token_item = COALESCE(?, token_quantity),
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

// --- 1. Prepared Statements (Outside for performance) ---
const getOldDeliveryStmt = db.prepare(`SELECT order_number, delivery_quantity, sign FROM delivery WHERE id = ?`);
const getOrderDataStmt = db.prepare(`SELECT id, total_qty, delivered_qty, delivery_sheet_verified FROM orders WHERE order_number = ?`);
const updateOrderStatsStmt = db.prepare(`
  UPDATE orders
  SET delivered_qty = ?, balance_qty = ?, delivery_sheet_verified = ?, status = ?
  WHERE id = ?
`);

/**
 * Helper: Syncs an order's totals and verification counts.
 * @param {string} orderNumber
 * @param {number} qtyAdjustment - Change in quantity (e.g., -5 or +5)
 * @param {number} signAdjustment - Change in verification (e.g., -1 or +1)
 */
const syncOrderStats = (orderNumber, qtyAdjustment, signAdjustment) => {
  if (!orderNumber) return;
  const order = getOrderDataStmt.get(orderNumber);
  if (!order) return;

  const totalQty = Number(order.total_qty) || 0;

  // Recalculate Qty
  const newDelivered = Math.max(0, (Number(order.delivered_qty) || 0) + qtyAdjustment);
  const newBalance = Math.max(0, totalQty - newDelivered);

  // Recalculate Verified Count (Signatures)
  const newVerified = Math.max(0, (Number(order.delivery_sheet_verified) || 0) + signAdjustment);

  // Determine Status
  let newStatus = 'New';
  if (newDelivered >= totalQty && newBalance === 0) newStatus = 'Delivered';
  else if (newDelivered > 0) newStatus = 'Partial';

  updateOrderStatsStmt.run(newDelivered, newBalance, newVerified, newStatus, order.id);
};

// --- 2. Main Function ---
export function updateDeliveryById(data, id) {
  const executeTransaction = db.transaction((txData, txId) => {
    const old = getOldDeliveryStmt.get(txId);
    if (!old) throw new Error(`Delivery ID ${txId} not found.`);

    // Determine New Values
    const newOrderNum = txData.hasOwnProperty('order_number') ? txData.order_number : old.order_number;
    const newQty = txData.hasOwnProperty('delivery_quantity') ? Number(txData.delivery_quantity) : Number(old.delivery_quantity);
    const newSign = txData.hasOwnProperty('sign') ? txData.sign : old.sign;

    // Logic: Is this specific delivery "Verified"? (Has a signature/truthy value)
    const wasVerified = !!old.sign ? 1 : 0;
    const isVerified = !!newSign ? 1 : 0;

    // SCENARIO 1: Order Number Changed
    if (old.order_number && old.order_number !== newOrderNum) {
      // Remove stats from Old Order
      syncOrderStats(old.order_number, -old.delivery_quantity, -wasVerified);
      // Add stats to New Order
      syncOrderStats(newOrderNum, newQty, isVerified);
    }
    // SCENARIO 2: Same Order, but Qty or Sign changed
    else if (old.order_number === newOrderNum) {
      const qtyDiff = newQty - old.delivery_quantity;
      const signDiff = isVerified - wasVerified;

      if (qtyDiff !== 0 || signDiff !== 0) {
        syncOrderStats(newOrderNum, qtyDiff, signDiff);
      }
    }

    // 3. Update the Delivery table
    const updateDeliveryStmt = db.prepare(`
      UPDATE delivery SET
        order_number = ?, party_name = COALESCE(?, party_name),
        address = COALESCE(?, address), delivery_item = COALESCE(?, delivery_item),
        delivery_quantity = ?, sign = ?, is_cancelled = COALESCE(?, is_cancelled)
      WHERE id = ?
    `);

    updateDeliveryStmt.run(
      newOrderNum, txData.party_name ?? null, txData.address ?? null,
      txData.delivery_item ?? null, newQty, newSign,
      txData.is_cancelled !== undefined ? (txData.is_cancelled ? 1 : 0) : null,
      txId
    );

    return { success: true };
  });

  return executeTransaction(data, id);
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
    db.prepare(`
      UPDATE orders
      SET delivery_sheet_verified = delivery_sheet_verified + ?
      WHERE order_number = ?
    `).run(adjustment, row.order_number);

    // 3. Update the sign column in the delivery table
    // (Assuming tableName is 'delivery' based on your context)
    return db.prepare(`UPDATE delivery SET sign = ? WHERE id = ?`)
      .run(value, targetId);
  });

  // Execute the transaction
  return performUpdate(id, newValue);
}


export function deleteTokenById(id) {
  const query = `DELETE FROM delivery WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(id);
}