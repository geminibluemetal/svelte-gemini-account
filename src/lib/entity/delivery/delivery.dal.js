import db from '$lib/core/server/db';

const tableName = 'delivery'; // Token also uses delivery table

export function fetchAllDeliveryByDate(date) {
  const query = `SELECT * FROM ${tableName} WHERE DATE(created_at) = '${date}';`;
  const stat = db.prepare(query);
  return stat.all();
}

export function fetchDeliveryById(id) {
  const query = `SELECT * FROM ${tableName} WHERE id = '${id}';`;
  const stat = db.prepare(query);
  return stat.get();
}

export function fetchLastSerialByDate(date) {
  const query = `
    SELECT MAX(serial) as last_serial
    FROM delivery
    WHERE DATE(created_at) = ?;
  `;
  const stat = db.prepare(query);
  const result = stat.get(date); // Use get() for single result
  return result ? result.last_serial : 0;
}

export function insertToken(data) {
  // Assuming your table has DEFAULT values for some columns
  const query = `
    INSERT INTO delivery (
      party_name,
      vehicle,
      token_item,
      token_quantity,
      is_cancelled,
      serial,
      token_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.party_name || null,
    data.vehicle || '',
    data.token_item || '',
    data.token_quantity || 0,
    data.is_cancelled ? 1 : 0,
    data.serial || 0,
    data.token_time || ''
  ];

  const stmt = db.prepare(query);
  return stmt.run(params);
}

export function updateTokenById(data, id) {
  // Define all possible fields based on table schema
  const query = `
    UPDATE delivery SET
      party_name = COALESCE(?, party_name),
      token_item = COALESCE(?, token_quantity),
      token_quantity = COALESCE(?, token_quantity),
      vehicle = COALESCE(?, vehicle),
      is_cancelled = COALESCE(?, is_cancelled)
    WHERE id = ?
  `;

  const params = [
    data.party_name !== undefined ? data.party_name : null,
    data.token_item !== undefined ? data.token_item : null,
    data.token_quantity !== undefined ? data.token_quantity : null,
    data.vehicle !== undefined ? data.vehicle : null,
    data.is_cancelled !== undefined ? (data.is_cancelled ? 1 : 0) : null,
    id
  ];

  const stmt = db.prepare(query);
  return stmt.run(params);
}
