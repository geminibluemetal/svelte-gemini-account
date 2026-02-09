import db from '$lib/core/server/db';

const tableName = 'orders';

export function fetchAllOrders() {
  const query = `SELECT * FROM ${tableName}`;
  const stat = db.prepare(query);
  db.pragma('wal_checkpoint(TRUNCATE)');
  return stat.all();
}

export function fetchOrdersByStatus(statusArray) {
  // Create placeholders for each status (?, ?, ?, etc.)
  const placeholders = statusArray.map(() => '?').join(',');
  const query = `SELECT * FROM ${tableName} WHERE status IN (${placeholders})`;
  const stat = db.prepare(query);
  return stat.all(...statusArray);
}

export function fetchSingleOrderById(id) {
  const query = `SELECT * FROM ${tableName} WHERE id = '${id}'`;
  const stat = db.prepare(query);
  return stat.get();
}

export function updateSingleOrderColumn(id, columnName, newValue) {
  // Use parameterized query to prevent SQL injection
  const query = `UPDATE ${tableName} SET ${columnName} = ? WHERE id = ?`;
  const stat = db.prepare(query);
  return stat.run(newValue, id);
}

export function insertOrder(data) {
  const query = `
    INSERT INTO orders (
      date,
      order_number,
      party_name,
      address,
      phone,
      item,
      total_qty,
      amount_type,
      amount,
      advance,
      discount,
      balance,
      sign,
      is_owner_order,
      tracktor_only,
      delivered_qty,
      balance_qty,
      notes,
      status,
      delivery_sheet_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const stat = db.prepare(query);

  // Convert boolean values to integers (0 or 1) for SQLite
  return stat.run(
    data.date || new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    data.order_number,
    data.party_name,
    data.address || null,
    data.phone || null,
    data.item,
    data.total_qty || 0,
    data.amount_type,
    data.amount || 0,
    data.advance || 0,
    data.discount || 0,
    data.balance || 0,
    data.sign ? 1 : 0, // Convert boolean to integer
    data.is_owner_order ? 1 : 0, // Convert boolean to integer
    data.tracktor_only ? 1 : 0, // Convert boolean to integer
    data.delivered_qty || 0,
    data.balance_qty || 0,
    data.notes || '',
    data.status || 'New',
    data.delivery_sheet_verified || 0
  );
}

export function updateOrderById(id, data) {
  const query = `
    UPDATE orders
    SET
      party_name = ?,
      address = ?,
      phone = ?,
      item = ?,
      total_qty = ?,
      amount_type = ?,
      amount = ?,
      advance = ?,
      discount = ?,
      balance = ?,
      is_owner_order = ?,
      tracktor_only = ?,
      notes = ?
    WHERE id = ?
  `;

  const stat = db.prepare(query);

  return stat.run(
    data.party_name,
    data.address || null,
    data.phone || null,
    data.item,
    data.total_qty || 0,
    data.amount_type,
    data.amount || 0,
    data.advance || 0,
    data.discount || 0,
    data.balance || 0,
    data.is_owner_order ? 1 : 0,
    data.tracktor_only ? 1 : 0,
    data.notes || '',
    id
  );
}

export function deleteOrderById(id) {
  const query = `DELETE FROM orders WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(id);
}
