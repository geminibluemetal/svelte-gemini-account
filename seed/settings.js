// seed/settings.js
export const tableName = 'settings';

export const tableSchema = `
CREATE TABLE IF NOT EXISTS settings (
    last_order_number INTEGER NOT NULL
);
`
export const seedData = [
  { last_order_number: 0 }
]