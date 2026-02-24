// seed/orders.js
export const tableName = 'orders';

export const tableSchema = `
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE DEFAULT CURRENT_DATE,
    order_number INTEGER NOT NULL,
    party_name TEXT,
    address TEXT,
    phone TEXT,
    item TEXT NOT NULL,
    total_qty DECIMAL(10, 2) NOT NULL,
    amount_time TEXT,
    amount_type TEXT NOT NULL,
    amount DECIMAL(10, 2) DEFAULT 0,
    advance DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    balance DECIMAL(10, 2) DEFAULT 0,
    sign BOOLEAN DEFAULT FALSE,
    is_owner_order BOOLEAN DEFAULT FALSE,
    tracktor_only BOOLEAN DEFAULT FALSE,
    delivered_qty DECIMAL(10, 2) DEFAULT 0,
    balance_qty DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'New',
    delivery_sheet_verified INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
