import db from '$lib/core/server/db';

export function fetchAllReportsByDate(date) {
  const query = `SELECT * FROM cash_reports WHERE DATE(created_at) = '${date}';`;
  const stat = db.prepare(query);
  db.pragma('wal_checkpoint(TRUNCATE)');
  return stat.all();
}