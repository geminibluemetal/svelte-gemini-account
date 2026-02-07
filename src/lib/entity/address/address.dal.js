import db from '$lib/core/server/db';

const tableName = 'address';

export function fetchAllAddress() {
  const query = `SELECT * FROM ${tableName}`;
  const stat = db.prepare(query);
  return stat.all();
}

export function fetchSingleAddressByName(name) {
  const query = `SELECT * FROM ${tableName} WHERE name = '${name}'`;
  const stat = db.prepare(query);
  return stat.get();
}

export function insertAddress(data) {
  const query = `
    INSERT INTO ${tableName} (name, delivery_025, delivery_050_100, delivery_max)
    VALUES (?, ?, ?, ?)
  `;
  const stat = db.prepare(query);
  return stat.run(
    data.name,
    data.delivery_025 || null,
    data.delivery_050_100 || null,
    data.delivery_max || null
  );
}

export function updateAddressById(data, id) {
  const query = `
    UPDATE ${tableName}
    SET name = ?,
        delivery_025 = ?,
        delivery_050_100 = ?,
        delivery_max = ?
    WHERE id = ?
  `;

  const stmt = db.prepare(query);
  return stmt.run(
    data.name,
    data.delivery_025 || null,
    data.delivery_050_100 || null,
    data.delivery_max || null,
    id
  );
}
export function deleteAddressById(id) {
  const query = `DELETE FROM address WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(id);
}

export function checkAddressNameExists(name, id) {
  const query = `SELECT * FROM ${tableName} WHERE name = ? AND id != ?`;
  const stmt = db.prepare(query);
  return stmt.get(name, id);
}
