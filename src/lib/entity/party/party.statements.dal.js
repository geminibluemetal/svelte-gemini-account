import db from '$lib/core/server/db';

export const tableName = 'party_statements';

export function insertPartyOldBalance(data) {
  const query = `
    INSERT INTO ${tableName} (party_id, amount_type, amount, entry_type)
    VALUES (?, ?, ?, ?)
  `;
  const stat = db.prepare(query);
  return stat.run(data.party_id, data.amount_type, data.amount, data.entry_type);
}

export function updatePartyOldBalance(data, id) {
  const query = `
    UPDATE ${tableName}
    SET party_id = ?,
        amount_type = ?,
        amount = ?,
        entry_type = ?
    WHERE id = ?
  `;
  const stat = db.prepare(query);
  return stat.run(data.party_id, data.amount_type, data.amount, data.entry_type, id);
}

export function fetchAllOldBalanceByDate(date) {
  const query = `
    SELECT
      ob.id,
      ob.party_id,
      p.name as party_name,
      ob.amount_type,
      ob.amount,
      ob.sign,
      ob.entry_type
    FROM ${tableName} ob
    INNER JOIN party p ON ob.party_id = p.id
    WHERE DATE(ob.created_at) = '${date}'
    AND ob.entry_type = 'CREDIT';
  `;
  const stat = db.prepare(query);
  db.pragma('wal_checkpoint(TRUNCATE)');
  return stat.all();
}

export function getAllOldBalanceCash(date) {
  const query = `
    SELECT
      ob.id,
      ob.party_id,
      'OB' AS serial,
      TIME(ob.time, 'localtime') AS time,
      p.name || ' O/B' AS description,
      ob.amount_type,
      ob.amount,
      ob.sign,
      ob.entry_type,
      'OB' AS source
    FROM ${tableName} ob
    INNER JOIN party p ON ob.party_id = p.id
    WHERE ob.created_at >= ?
      AND ob.created_at < date(?, '+1 day')
      AND ob.entry_type = 'CREDIT'
      AND ob.amount_type = 'Cash'
  `;

  const stat = db.prepare(query);
  return stat.all(date, date);
}

export function signOldBalance(id, newValue) {
  const stat = db.prepare(`UPDATE ${tableName} SET sign = ? WHERE id = ?`);
  return stat.run(newValue, id);
}
