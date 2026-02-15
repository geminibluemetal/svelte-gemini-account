import db from "$lib/core/server/db";

export function fetchAllCash(date) {
  const stmt = db.prepare(`
    SELECT * FROM cash WHERE DATE(created_at) = ?
  `);

  return stmt.all(date);
}
