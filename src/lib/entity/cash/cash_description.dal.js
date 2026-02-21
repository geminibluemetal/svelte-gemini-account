import db from "$lib/core/server/db";

export function fetchAllCashDescription() {
  const stmt = db.prepare(`
    SELECT * FROM cash_description
  `);

  return stmt.all();
}

export function checkDescriptionExist(value) {
  const stmt = db.prepare(`
    SELECT id FROM cash_description WHERE description = ?
  `);

  return stmt.get(value);
}

export function insertCashDescription(description) {
  const query = `
    INSERT INTO cash_description (description) VALUES (?)
  `;
  const stmt = db.prepare(query);
  return stmt.run(description);
}