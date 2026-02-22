// seed/cash_reports.js
export const tableName = 'cash_reports';

export const tableSchema = `
CREATE TABLE IF NOT EXISTS cash_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
