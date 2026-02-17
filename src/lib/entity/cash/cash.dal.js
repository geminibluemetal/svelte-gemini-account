import db from "$lib/core/server/db";

export function fetchAllCash(date) {
  const stmt = db.prepare(`
    SELECT
      c.*,
      'CASH' AS source,
      'OA-' || o.order_number AS serial,
      TIME(c.time, 'localtime') AS time
    FROM cash c
    JOIN orders o ON c.order_id = o.id
    WHERE DATE(c.created_at) = ?;
  `);

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
    entry_type || 'EXPENSE',
  );
}