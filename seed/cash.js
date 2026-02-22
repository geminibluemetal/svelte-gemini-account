// seed/cash.js
export const tableName = 'cash';

export const tableSchema = `
CREATE TABLE IF NOT EXISTS cash (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    date DATE DEFAULT (DATE('now')),
    time TIME DEFAULT (TIME('now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    entry_type TEXT CHECK(entry_type IN ('INCOME', 'EXPENSE')) NOT NULL,
    sign INTEGER DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cash_date ON cash(date);
`;
