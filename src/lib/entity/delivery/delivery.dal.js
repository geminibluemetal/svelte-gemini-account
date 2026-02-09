import db from '$lib/core/server/db';

const tableName = 'delivery'; // Token also uses delivery table

export function fetchAllDeliveryByDate(date) {
  const query = `SELECT * FROM ${tableName} WHERE DATE(created_at) = '${date}';`;
  const stat = db.prepare(query);
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

export function updateDeliveryById(data, id) {
  // --- Prepared Statements ---
  const getOldDeliveryStmt = db.prepare(`SELECT order_number, delivery_quantity FROM delivery WHERE id = ?`);

  const updateDeliveryStmt = db.prepare(`
    UPDATE delivery SET
      order_number = ?, party_name = COALESCE(?, party_name), address = COALESCE(?, address),
      delivery_time = CASE WHEN delivery_time IS NULL OR delivery_time = '' THEN ? ELSE delivery_time END,
      delivery_item = COALESCE(?, delivery_item), delivery_quantity = ?,
      amount_type_1 = COALESCE(?, amount_type_1), is_cancelled = COALESCE(?, is_cancelled)
    WHERE id = ?
  `);

  const getOrderDataStmt = db.prepare(`SELECT id, total_qty, delivered_qty FROM orders WHERE order_number = ?`);

  const updateOrderStatsStmt = db.prepare(`
    UPDATE orders SET delivered_qty = ?, balance_qty = ?, status = ? WHERE id = ?
  `);

  // --- Logic to Recalculate and Update Order ---
  const syncOrder = (orderNumber, quantityAdjustment) => {
    if (!orderNumber) return;
    const order = getOrderDataStmt.get(orderNumber);
    if (!order) return;

    // FIX: Convert everything to Number to avoid "1" + "1" = "11"
    const currentDelivered = Number(order.delivered_qty) || 0;
    const totalQty = Number(order.total_qty) || 0;
    const adjustment = Number(quantityAdjustment) || 0;

    const newDelivered = Math.max(0, currentDelivered + adjustment);
    const newBalance = Math.max(0, totalQty - newDelivered);

    let newStatus = 'New';
    if (newDelivered >= totalQty && newBalance === 0) {
      newStatus = 'Delivered';
    } else if (newDelivered > 0) {
      newStatus = 'Partial';
    }

    updateOrderStatsStmt.run(newDelivered, newBalance, newStatus, order.id);
  };

  // --- The Transaction ---
  const executeTransaction = db.transaction((txData, txId) => {
    // 1. Get Old Data
    const oldDelivery = getOldDeliveryStmt.get(txId);
    if (!oldDelivery) throw new Error(`Delivery ID ${txId} not found.`);

    // 2. Determine New Data (Converting inputs to Numbers immediately)
    const newOrderNumber = txData.hasOwnProperty('order_number') ? txData.order_number : oldDelivery.order_number;

    // FIX: Force conversion to Number
    const newQty = Number(txData.hasOwnProperty('delivery_quantity') ? txData.delivery_quantity : oldDelivery.delivery_quantity) || 0;
    const oldQty = Number(oldDelivery.delivery_quantity) || 0;

    // 3. IF ORDER CHANGED OR REMOVED: Revert the old order
    if (oldDelivery.order_number && (oldDelivery.order_number !== newOrderNumber)) {
      syncOrder(oldDelivery.order_number, -oldQty);
    }
    // IF SAME ORDER BUT QTY CHANGED: Adjust the difference
    else if (oldDelivery.order_number && oldDelivery.order_number === newOrderNumber) {
      const qtyDifference = newQty - oldQty;
      if (qtyDifference !== 0) syncOrder(oldDelivery.order_number, qtyDifference);
    }

    // 4. IF NEW ORDER ADDED (and it's different): Apply the new quantity
    if (newOrderNumber && oldDelivery.order_number !== newOrderNumber) {
      syncOrder(newOrderNumber, newQty);
    }

    // 5. Update the Delivery table
    updateDeliveryStmt.run(
      newOrderNumber, txData.party_name ?? null, txData.address ?? null,
      txData.delivery_time ?? null, txData.delivery_item ?? null, newQty,
      txData.amount_type_1 ?? null, txData.is_cancelled !== undefined ? (txData.is_cancelled ? 1 : 0) : null,
      txId
    );

    return { success: true };
  });

  try {
    return executeTransaction(data, id);
  } catch (err) {
    console.error("Transaction Aborted:", err.message);
    throw err;
  }
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

export function updateSingleDeliveryColumn(id, columnName, newValue) {
  console.log(id, columnName, newValue)
  // Use parameterized query to prevent SQL injection
  const query = `UPDATE ${tableName} SET ${columnName} = ? WHERE id = ?`;
  const stat = db.prepare(query);
  return stat.run(newValue, id);
}