// seed/delivery_alter_1.js
export const tableName = 'delivery';

export const isAlteration = true;

export const tableSchema = `ALTER TABLE ${tableName} ADD COLUMN has_mark BOOLEAN DEFAULT FALSE;`;
