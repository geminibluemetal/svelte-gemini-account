// seed/items.js
export const tableName = 'items';

export const tableSchema = `
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    price_025 DECIMAL(10, 2) DEFAULT null,
    price_050 DECIMAL(10, 2) DEFAULT null,
    price_100 DECIMAL(10, 2) DEFAULT null,
    price_150 DECIMAL(10, 2) DEFAULT null,
    price_200 DECIMAL(10, 2) DEFAULT null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const seedData = [
  {
    name: 'MS',
    price_025: 1200.0,
    price_050: 2300.0,
    price_100: 4400.0,
    price_150: 6700.0,
    price_200: 8800.0
  },
  {
    name: 'PS',
    price_025: 1200.0,
    price_050: 2300.0,
    price_100: 4500.0,
    price_150: 6800.0,
    price_200: 9000.0
  },
  {
    name: '20mm',
    price_025: 800.0,
    price_050: 1500.0,
    price_100: 2800.0,
    price_150: 4300.0,
    price_200: 5600.0
  },
  {
    name: '50mm',
    price_025: 700.0,
    price_050: 1300.0,
    price_100: 2400.0,
    price_150: 3700.0,
    price_200: 4800.0
  },
  {
    name: '40mm',
    price_025: 700.0,
    price_050: 1300.0,
    price_100: 2400.0,
    price_150: 3700.0,
    price_200: 4800.0
  },
  {
    name: '12mm',
    price_025: 700.0,
    price_050: 1300.0,
    price_100: 2500.0,
    price_150: 3800.0,
    price_200: 5000.0
  },
  {
    name: '6mm',
    price_025: 700.0,
    price_050: 1300.0,
    price_100: 2500.0,
    price_150: 3800.0,
    price_200: 5000.0
  },
  {
    name: 'Dust',
    price_025: 800.0,
    price_050: 1500.0,
    price_100: 2800.0,
    price_150: 4300.0,
    price_200: 5600.0
  },
  {
    name: 'Allmix',
    price_025: 700.0,
    price_050: 1300.0,
    price_100: 2400.0,
    price_150: 3700.0,
    price_200: 4800.0
  },
  {
    name: 'Mixing',
    price_025: 350.0,
    price_050: 700.0,
    price_100: 1400.0,
    price_150: 2200.0,
    price_200: 2800.0
  },
  {
    name: 'MW',
    price_025: 150.0,
    price_050: 250.0,
    price_100: 400.0,
    price_150: 650.0,
    price_200: 800.0
  },
  {
    name: '6sb',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '4sb',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: 'MS + 20mm',
    price_025: null,
    price_050: 2000.0,
    price_100: 3800.0,
    price_150: null,
    price_200: 7400.0
  },
  {
    name: 'MS + Dust',
    price_025: null,
    price_050: 2000.0,
    price_100: 3800.0,
    price_150: null,
    price_200: 7400.0
  },
  {
    name: 'MS + PS',
    price_025: null,
    price_050: 2300.0,
    price_100: 5000.0,
    price_150: null,
    price_200: 9000.0
  },
  {
    name: '12mm + 6mm',
    price_025: null,
    price_050: 1300.0,
    price_100: 2500.0,
    price_150: null,
    price_200: 5000.0
  },
  {
    name: 'PS + 20mm',
    price_025: null,
    price_050: null,
    price_100: 3800.0,
    price_150: null,
    price_200: null
  },
  {
    name: 'MS + 12mm',
    price_025: null,
    price_050: null,
    price_100: 3600.0,
    price_150: null,
    price_200: 6900.0
  },
  {
    name: 'MS + 50mm',
    price_025: null,
    price_050: null,
    price_100: 3500.0,
    price_150: null,
    price_200: null
  },
  {
    name: 'MS + 6mm',
    price_025: null,
    price_050: null,
    price_100: 3600.0,
    price_150: null,
    price_200: null
  },
  {
    name: 'MS + 40mm',
    price_025: null,
    price_050: null,
    price_100: 3500.0,
    price_150: null,
    price_200: null
  },
  {
    name: 'PS + 12mm',
    price_025: null,
    price_050: null,
    price_100: 3600.0,
    price_150: null,
    price_200: null
  },
  {
    name: 'PS + 40mm',
    price_025: null,
    price_050: null,
    price_100: 3600.0,
    price_150: null,
    price_200: null
  },
  {
    name: 'PS + 50mm',
    price_025: null,
    price_050: null,
    price_100: 3600.0,
    price_150: null,
    price_200: null
  },
  {
    name: 'PS + 6mm',
    price_025: null,
    price_050: null,
    price_100: 3600.0,
    price_150: null,
    price_200: null
  },
  {
    name: 'PS + Dust',
    price_025: null,
    price_050: null,
    price_100: 3800.0,
    price_150: null,
    price_200: null
  },
  {
    name: '12mm + 20mm',
    price_025: null,
    price_050: null,
    price_100: 2800.0,
    price_150: null,
    price_200: null
  },
  {
    name: '12mm + 40mm',
    price_025: null,
    price_050: null,
    price_100: 2600.0,
    price_150: null,
    price_200: null
  },
  {
    name: '12mm + 50mm',
    price_025: null,
    price_050: null,
    price_100: 2600.0,
    price_150: null,
    price_200: null
  },
  {
    name: '12mm + Dust',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '20mm + 40mm',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '20mm + 50mm',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '20mm + Allmix',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '20mm + Mix',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '20mm + Dust',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '40mm + 50mm',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '40mm + 6mm',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '40mm + Allmix',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '40mm + Mix',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '40mm + Dust',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '50mm + 6mm',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '50mm + Allmix',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '50mm + Mix',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '50mm + Dust',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '6mm + Allmix',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '6mm + Mix',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  },
  {
    name: '6mm + Dust',
    price_025: null,
    price_050: null,
    price_100: null,
    price_150: null,
    price_200: null
  }
];
