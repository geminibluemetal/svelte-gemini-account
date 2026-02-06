import db from "$lib/core/server/db";

const tableName = 'orders';

export function fetchAllOrders() {
  const query = `SELECT * FROM ${tableName}`;
  const stat = db.prepare(query);
  return stat.all();
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