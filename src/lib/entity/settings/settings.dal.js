import db from "$lib/core/server/db";

const tableName = 'settings';

export function fetchSettings() {
  const query = `SELECT * FROM ${tableName}`
  const stat = db.prepare(query)
  return stat.get();
}

export function setSettings(settingsObj) {
  if (!settingsObj || typeof settingsObj !== 'object') {
    throw new Error('Settings must be an object');
  }

  // Build query
  const columns = Object.keys(settingsObj);
  const values = Object.values(settingsObj);
  const setClause = columns.map(col => `${col} = ?`).join(', ');

  const query = `UPDATE ${tableName} SET ${setClause}`;
  const stat = db.prepare(query);

  return stat.run(...values);
}