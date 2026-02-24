import db from '$lib/core/server/db';

export function fetchAllCash(date) {
  const stmt = db.prepare(`
    SELECT
      c.*,
      'CASH' AS source,
      CASE
        WHEN c.order_id IS NOT NULL THEN 'OA-' || o.order_number
        ELSE ''
      END AS serial,
      strftime('%Y-%m-%dT%H:%M:%SZ', c.created_at) AS time
    FROM cash c
    LEFT JOIN orders o ON c.order_id = o.id
    WHERE DATE(c.created_at) = ?;
  `);
  db.pragma('wal_checkpoint(TRUNCATE)');
  return stmt.all(date);
}

export function insertCash(data, entry_type) {
  const query = `
    INSERT INTO cash (order_id, amount, description, sign, entry_type)
    VALUES (?, ?, ?, ?, ?)
  `;
  const stat = db.prepare(query);
  return stat.run(
    data.order_id || null,
    data.amount || 0,
    data.description || null,
    data.sign ? 1 : 0,
    entry_type || 'INCOME'
  );
}

export function updateCash(data, entry_type, id) {
  const query = `
    UPDATE cash
    SET
      order_id = ?,
      amount = ?,
      description = ?,
      sign = ?,
      entry_type = ?
    WHERE id = ?
  `;

  const stat = db.prepare(query);

  return stat.run(
    data.order_id || null,
    data.amount || 0,
    data.description || null,
    data.sign ? 1 : 0,
    entry_type || 'INCOME',
    id
  );
}

export function fetchCashByOrderId(order_id) {
  const query = `
    SELECT * FROM cash WHERE order_id = ?
  `;
  const stat = db.prepare(query);
  return stat.get(order_id);
}

export function fetchSingleCashById(id) {
  const query = `
    SELECT * FROM cash WHERE id = ?
  `;
  const stat = db.prepare(query);
  return stat.get(id);
}

export function deleteCashByOrderId(order_id) {
  const query = `
    DELETE FROM cash WHERE order_id = ?
  `;
  const stat = db.prepare(query);
  return stat.run(order_id);
}

export function deleteCashById(id) {
  const query = `
    DELETE FROM cash WHERE id = ?
  `;
  const stat = db.prepare(query);
  return stat.run(id);
}

export function signCashById(id, value) {
  const query = `UPDATE cash SET sign = ? WHERE id = ?`;
  const stat = db.prepare(query);
  return stat.run(value, id);
}
