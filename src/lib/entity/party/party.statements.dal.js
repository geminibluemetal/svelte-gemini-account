import db from '$lib/core/server/db';

export const tableName = 'party_statements';

export function insertPartyOldBalance(data) {
  const query = `
    INSERT INTO ${tableName} (party_id, amount_type, amount, entry_type, time)
    VALUES (?, ?, ?, ?, ?)
  `;
  const stat = db.prepare(query);
  return stat.run(
    data.party_id,
    data.amount_type,
    data.amount,
    data.entry_type,
    data.amount_type == 'Cash' && Number(data.amount) ? new Date().toISOString() : ''
  );
}

export function updatePartyOldBalance(data, id) {
  const query = `
    UPDATE ${tableName}
    SET party_id = ?,
        amount_type = ?,
        amount = ?,
        entry_type = ?,
        time = ?
    WHERE id = ?
  `;
  const stat = db.prepare(query);
  return stat.run(
    data.party_id,
    data.amount_type,
    data.amount,
    data.entry_type,
    data.amount_type == 'Cash' && Number(data.amount) ? new Date().toISOString() : '',
    id
  );
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
      strftime('%Y-%m-%dT%H:%M:%Sz', ob.time) AS time,
      p.name || ' O/B' AS description,
      ob.amount_type,
      ob.amount,
      ob.sign,
      ob.entry_type,
      ob.created_at,
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

export function deletePartyStatementById(id) {
  const query = `DELETE FROM ${tableName} WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(id);
}

export function fetchAllBalanceForParty() {
  const query = `
    SELECT
        p.id,
        p.name,
        p.phone,
        p.opening_balance,
        COALESCE(SUM(CASE WHEN ps.entry_type = 'CREDIT' THEN ps.amount ELSE 0 END), 0) as total_credit,
        COALESCE(SUM(CASE WHEN ps.entry_type = 'DEBIT' THEN ps.amount ELSE 0 END), 0) as total_debit,
        (p.opening_balance +
         COALESCE(SUM(CASE WHEN ps.entry_type = 'CREDIT' THEN ps.amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN ps.entry_type = 'DEBIT' THEN ps.amount ELSE 0 END), 0)
        ) AS current_balance
    FROM party p
    LEFT JOIN party_statements ps ON p.id = ps.party_id
    GROUP BY p.id
    HAVING current_balance != 0
    ORDER BY p.name ASC
  `;

  try {
    const stmt = db.prepare(query);
    return stmt.all();
  } catch (error) {
    console.error("Failed to fetch party balances:", error);
    return [];
  }
}

export function fetchPartyStatementByPartyId(id) {
  const query = `
    SELECT
      ps.id,
      -- Extract date from ISO string or use as is
      DATE(ps.time) as date,
      ps.time,
      ps.vehicle,
      ps.address,
      ps.item,
      ps.qty,
      ps.amount,
      ps.entry_type,
      ps.sign,
      -- Conditional columns for UI display
      CASE WHEN ps.entry_type = 'CREDIT' THEN ps.amount ELSE 0 END as credit,
      CASE WHEN ps.entry_type = 'DEBIT' THEN ps.amount ELSE 0 END as debit,
      -- Running Balance Calculation
      (
        p.opening_balance +
        SUM(
          CASE
            WHEN ps.entry_type = 'CREDIT' THEN ps.amount
            WHEN ps.entry_type = 'DEBIT' THEN -ps.amount
            ELSE 0
          END
        ) OVER (
          ORDER BY ps.time ASC, ps.id ASC
        )
      ) as running_balance
    FROM party_statements ps
    JOIN party p ON ps.party_id = p.id
    WHERE ps.party_id = ?
    ORDER BY ps.time ASC, ps.id ASC
  `;

  try {
    const stmt = db.prepare(query);
    return stmt.all(id);
  } catch (error) {
    console.error("Failed to fetch party ledger:", error);
    return [];
  }
}