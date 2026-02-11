// seed/delivery.js
export const tableName = 'party_statements';

export const tableSchema = `
CREATE TABLE IF NOT EXISTS party_statements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    party_id INTEGER NOT NULL,
    delivery_id INTEGER,

    -- Financial Core
    amount_type TEXT,
    entry_type TEXT CHECK(entry_type IN ('DEBIT', 'CREDIT')) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,

    -- Item Details
    item TEXT,
    qty DECIMAL(10, 2) DEFAULT 0.00,

    -- Logistical Info
    vehicle TEXT,
    address TEXT,

    -- Timestamps
    date DATE DEFAULT (DATE('now')),
    time TIME DEFAULT (TIME('now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    sign INTEGER DEFAULT 0, -- 0 for false, 1 for true
    FOREIGN KEY (party_id) REFERENCES party(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_party_statements_party_id ON party_statements(party_id);
CREATE INDEX IF NOT EXISTS idx_party_statements_date ON party_statements(date);
`;
