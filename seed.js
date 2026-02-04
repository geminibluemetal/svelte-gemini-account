// seed.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeeds() {
  console.log('🚀 Starting database seeding...');

  const db = new Database('database/app.db');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  try {
    // Get all seed files from seed directory
    const seedDir = path.join(__dirname, 'seed');
    const files = await fs.readdir(seedDir);

    // Filter for .js files
    const seedFiles = files
      .filter(file => file.endsWith('.js') && file !== 'index.js')
      .sort();

    console.log(`📁 Found ${seedFiles.length} seed files`);

    // Run each seed file
    for (const file of seedFiles) {
      const filePath = path.join(seedDir, file);
      console.log(`\n📄 Processing: ${file}`);

      try {
        // Convert Windows path to file:// URL for dynamic import
        const fileUrl = pathToFileURL(filePath).href;

        // Dynamically import the seed module
        const module = await import(fileUrl);

        if (!module.tableName || !module.tableSchema) {
          console.log(`   ⚠️  Skipping: Missing tableName or tableSchema export`);
          continue;
        }

        // Check if table already exists
        const tableCheck = db.prepare(`
          SELECT name FROM sqlite_master
          WHERE type='table' AND name=?;
        `).get(module.tableName);

        if (tableCheck) {
          console.log(`   ⏭️  Table '${module.tableName}' already exists, skipping`);
          continue;
        }

        // Create table using schema from module
        console.log(`   📊 Creating table '${module.tableName}'...`);
        db.exec(module.tableSchema);

        // Run seed data if provided
        if (module.seedData && Array.isArray(module.seedData)) {
          console.log(`   🌱 Seeding ${module.seedData.length} records...`);

          if (module.seedData.length > 0) {
            // Get column names from first object
            const columns = Object.keys(module.seedData[0]);
            const placeholders = columns.map(() => '?').join(', ');

            const insertQuery = `
              INSERT OR IGNORE INTO ${module.tableName}
              (${columns.join(', ')})
              VALUES (${placeholders})
            `;

            const stmt = db.prepare(insertQuery);

            // Insert all seed data
            for (const data of module.seedData) {
              const values = columns.map(col => data[col]);
              stmt.run(...values);
            }
          }
        }

        console.log(`   ✅ '${module.tableName}' seeded successfully`);

      } catch (error) {
        console.error(`   ❌ Error in ${file}:`, error.message);
        // Continue with other seeds instead of throwing
        // throw error; // Remove this to continue on error
      }
    }

    console.log('\n🎉 All seeds completed!');

  } catch (error) {
    console.error('💥 Seed process failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

runSeeds()