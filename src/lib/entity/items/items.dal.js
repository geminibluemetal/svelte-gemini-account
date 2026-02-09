import db from '$lib/core/server/db';

const tableName = 'items';

export function fetchAllItems() {
  const query = `SELECT * FROM ${tableName}`;
  const stat = db.prepare(query);
  db.pragma('wal_checkpoint(TRUNCATE)');
  return stat.all();
}

export function fetchSingleItemByName(name) {
  const query = `SELECT * FROM ${tableName} WHERE name = '${name}'`;
  const stat = db.prepare(query);
  return stat.get();
}

export function insertItem(data) {
  const query = `
    INSERT INTO ${tableName} (name, price_025, price_050, price_100, price_150, price_200)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const stat = db.prepare(query);
  return stat.run(
    data.name,
    data.price_025 || null,
    data.price_050 || null,
    data.price_100 || null,
    data.price_150 || null,
    data.price_200 || null
  );
}

export function updateItemById(data, id) {
  const query = `
    UPDATE ${tableName}
    SET name = ?,
        price_025 = ?,
        price_050 = ?,
        price_100 = ?,
        price_150 = ?,
        price_200 = ?
    WHERE id = ?
  `;

  const stmt = db.prepare(query);
  return stmt.run(
    data.name,
    data.price_025 || null,
    data.price_050 || null,
    data.price_100 || null,
    data.price_150 || null,
    data.price_200 || null,
    id
  );
}
export function deleteItemById(id) {
  const query = `DELETE FROM items WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(id);
}

export function checkItemNameExists(name, id) {
  const query = `SELECT * FROM ${tableName} WHERE name = ? AND id != ?`;
  const stmt = db.prepare(query);
  return stmt.get(name, id);
}
