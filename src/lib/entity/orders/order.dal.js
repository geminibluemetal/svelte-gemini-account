import db from "$lib/core/server/db";

const tableName = 'orders';

export function fetchAllOrders() {
  const query = `SELECT * FROM ${tableName}`
  const stat = db.prepare(query)
  return stat.all();
}

export function insertOrder(data) {
  // const query = `
  //   INSERT INTO ${tableName} (name, price_025, price_050, price_100, price_150, price_200)
  //   VALUES (?, ?, ?, ?, ?, ?)
  // `;
  // const stat = db.prepare(query);
  // return stat.run(
  //   data.name,
  //   data.price_025 || null,
  //   data.price_050 || null,
  //   data.price_100 || null,
  //   data.price_150 || null,
  //   data.price_200 || null
  // );
}