import db from '$lib/core/server/db';

const tableName = 'vehicle';

export function fetchAllVehicle() {
  const query = `SELECT * FROM ${tableName}`;
  const stat = db.prepare(query);
  db.pragma('wal_checkpoint(TRUNCATE)');
  return stat.all();
}

export function fetchSingleVehicleByShortName(short_number) {
  const query = `SELECT * FROM ${tableName} WHERE short_number = '${short_number}'`;
  const stat = db.prepare(query);
  return stat.get();
}

export function insertVehicle(data) {
  const query = `
    INSERT INTO ${tableName} (full_number, short_number, is_company_vehicle, body_capacity)
    VALUES (?, ?, ?, ?)
  `;
  const stat = db.prepare(query);
  return stat.run(
    data.full_number || null,
    data.short_number || null,
    data.is_company_vehicle ? 1 : 0, // Convert boolean to integer
    data.body_capacity || null,
  );
}

export function updateVehicleById(data, id) {
  const query = `
    UPDATE ${tableName}
    SET full_number = ?,
        short_number = ?,
        is_company_vehicle = ?,
        body_capacity = ?
    WHERE id = ?
  `;

  const stmt = db.prepare(query);
  return stmt.run(
    data.full_number || null,
    data.short_number || null,
    data.is_company_vehicle ? 1 : 0, // Convert boolean to integer
    data.body_capacity || null,
    id,
  );
}
export function deleteVehicleById(id) {
  const query = `DELETE FROM vehicle WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(id);
}

export function checkVehicleShortNameExists(short_number, id) {
  const query = `SELECT * FROM ${tableName} WHERE short_number = ? AND id != ?`;
  const stmt = db.prepare(query);
  return stmt.get(short_number, id);
}
