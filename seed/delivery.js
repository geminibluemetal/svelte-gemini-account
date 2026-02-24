// seed/delivery.js
export const tableName = 'delivery';

export const tableSchema = `
CREATE TABLE IF NOT EXISTS delivery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial INTEGER NOT NULL,
    token_time TEXT,
    delivery_time TEXT,
    amount_time TEXT,
    order_number TEXT,
    party_name TEXT,
    address TEXT,
    token_item TEXT NOT NULL,
    token_quantity REAL NOT NULL,
    delivery_item TEXT,
    delivery_quantity REAL,
    amount_type_1 TEXT,
    amount_type_2 TEXT,
    amount_1 REAL,
    amount_2 REAL,
    sign BOOLEAN DEFAULT FALSE,
    has_mark BOOLEAN DEFAULT FALSE,
    vehicle TEXT NOT NULL,
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
