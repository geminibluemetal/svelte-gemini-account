import db from '$lib/core/server/db';

export function fetchAllReportsByDate(date) {
  const query = `
    SELECT *
    FROM cash_reports
    WHERE DATE(created_at) = ?
    ORDER BY created_at ASC
  `;

  const stat = db.prepare(query);
  return stat.all(date);
}

export function checkReportExistsByDate(date) {
  // Use SELECT 1 and LIMIT 1 for maximum performance
  const query = `SELECT 1 FROM cash_reports WHERE DATE(created_at) = ? LIMIT 1`;

  const stat = db.prepare(query);
  const result = stat.get(date); // .get() returns the first row found or undefined

  // Returns true if a row exists, false otherwise
  return !!result;
}

export function insertCashReport() {
  const stmt = db.prepare('INSERT INTO cash_reports DEFAULT VALUES');
  return stmt.run();
}

export function deleteCashReportById(id) {
  const stmt = db.prepare(`DELETE FROM cash_reports WHERE id = ?`);
  return stmt.run(id);
}