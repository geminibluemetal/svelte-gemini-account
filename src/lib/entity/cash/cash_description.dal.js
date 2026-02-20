import db from "$lib/core/server/db";

export function fetchAllCashDescription() {
  const stmt = db.prepare(`
    SELECT * FROM cash_description
  `);

  return stmt.all();
}