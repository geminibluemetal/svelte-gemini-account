import db from "$lib/core/server/db";

const tableName = 'items';

export function fetchAllItems() {
  const query = `SELECT * FROM ${tableName}`
  const stat = db.prepare(query)
  return stat.all();
}