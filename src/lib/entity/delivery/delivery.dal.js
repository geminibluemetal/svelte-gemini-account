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

export function updateDeliveryById(data, id) {
  // Delivery Time only udpates only once first time only, if already value exist don't change.
  const query = `
    UPDATE delivery SET
      order_number = COALESCE(?, order_number),
      party_name = COALESCE(?, party_name),
      address = COALESCE(?, address),
      delivery_time = CASE
        WHEN delivery_time IS NULL OR delivery_time = ''
        THEN ?
        ELSE delivery_time
      END,
      delivery_item = COALESCE(?, delivery_item),
      delivery_quantity = COALESCE(?, delivery_quantity),
      amount_type_1 = COALESCE(?, amount_type_1),
      is_cancelled = COALESCE(?, is_cancelled)
    WHERE id = ?
  `;

  const params = [
    data.order_number !== undefined ? data.order_number : null,
    data.party_name !== undefined ? data.party_name : null,
    data.address !== undefined ? data.address : null,
    data.delivery_time !== undefined ? data.delivery_time : null,
    data.delivery_item !== undefined ? data.delivery_item : null,
    data.delivery_quantity !== undefined ? data.delivery_quantity : null,
    data.amount_type_1 !== undefined ? data.amount_type_1 : null,
    data.is_cancelled !== undefined ? (data.is_cancelled ? 1 : 0) : null,
    id
  ];

  const stmt = db.prepare(query);
  return stmt.run(params);
}

export function updateDeliveryAmountById(data, id) {
  const query = `
    UPDATE delivery SET
      amount_type_1 = COALESCE(?, amount_type_1),
      amount_1 = COALESCE(?, amount_1),
      amount_type_2 = COALESCE(?, amount_type_2),
      amount_2 = COALESCE(?, amount_2)
    WHERE id = ?
  `;

  const params = [
    data.amount_type_1 !== undefined ? data.amount_type_1 : null,
    data.amount_1 !== undefined ? data.amount_1 : null,
    data.amount_type_2 !== undefined ? data.amount_type_2 : null,
    data.amount_2 !== undefined ? data.amount_2 : null,
    id
  ];

  const stmt = db.prepare(query);
  return stmt.run(params);
}

export function updateSingleDeliveryColumn(id, columnName, newValue) {
  console.log(id, columnName, newValue)
  // Use parameterized query to prevent SQL injection
  const query = `UPDATE ${tableName} SET ${columnName} = ? WHERE id = ?`;
  const stat = db.prepare(query);
  return stat.run(newValue, id);
}