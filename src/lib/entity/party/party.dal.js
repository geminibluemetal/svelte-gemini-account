import db from "$lib/core/server/db";

const tableName = 'party';

export function fetchAllParty() {
  const query = `SELECT * FROM ${tableName}`
  const stat = db.prepare(query)
  return stat.all();
}

export function fetchSinglePartyByName(name) {
  const query = `SELECT * FROM ${tableName} WHERE name = '${name}'`
  const stat = db.prepare(query)
  return stat.get();
}

export function updatePhoneByPartyName(name, phone) {
  const query = `
    UPDATE ${tableName}
    SET phone = ?
    WHERE name = ?
  `;
  const stmt = db.prepare(query);
  return stmt.run(phone, name);
}

export function insertParty(data) {
  const query = `
    INSERT INTO ${tableName} (name, phone)
    VALUES (?, ?)
  `;
  const stat = db.prepare(query);
  return stat.run(
    data.name,
    data.phone || null
  );
}

export function updatePartyById(data, id) {
  const query = `
    UPDATE ${tableName}
    SET name = ?,
        phone = ?
    WHERE id = ?
  `;

  const stmt = db.prepare(query);
  return stmt.run(
    data.name,
    data.phone || null,
    id
  );
}
export function deletePartyById(id) {
  const query = `DELETE FROM party WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(id);
}

export function checkPartyNameExists(name, id) {
  const query = `SELECT * FROM ${tableName} WHERE name = ? AND id != ?`;
  const stmt = db.prepare(query);
  return stmt.get(name, id);
}