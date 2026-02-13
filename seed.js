import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeeds() {
  console.log('🚀 Starting database migrations and seeding...');

  const db = new Database('database/app.db');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  try {
    // 1. Create a migrations table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const seedDir = path.join(__dirname, 'seed');
    const files = await fs.readdir(seedDir);
    const seedFiles = files.filter((file) => file.endsWith('.js') && file !== 'index.js').sort();

    console.log(`📁 Found ${seedFiles.length} potential seed/migration files`);

    for (const file of seedFiles) {
      // 2. Check if this specific file has already been run
      const alreadyRun = db.prepare('SELECT name FROM _migrations WHERE name = ?').get(file);

      if (alreadyRun) {
        console.log(`  ⏭️  Skipping: ${file} (Already executed)`);
        continue;
      }

      console.log(`\n📄 Processing: ${file}`);
      const filePath = path.join(seedDir, file);
      const fileUrl = pathToFileURL(filePath).href;

      try {
        const module = await import(fileUrl);

        // Validation
        if (!module.tableSchema) {
          console.log(`  ⚠️  Skipping: ${file} is missing 'tableSchema' export`);
          continue;
        }

        // 3. Execute the SQL (Works for CREATE, ALTER, etc.)
        db.exec(module.tableSchema);

        // 4. Handle Seed Data if present
        if (
          module.tableName &&
          module.seedData &&
          Array.isArray(module.seedData) &&
          module.seedData.length > 0
        ) {
          console.log(
            `  🌱 Seeding ${module.seedData.length} records into '${module.tableName}'...`
          );

          const columns = Object.keys(module.seedData[0]);
          const placeholders = columns.map(() => '?').join(', ');
          const insertQuery = `INSERT OR IGNORE INTO ${module.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

          const stmt = db.prepare(insertQuery);
          const insertMany = db.transaction((data) => {
            for (const row of data) {
              const values = columns.map((col) => row[col]);
              stmt.run(...values);
            }
          });

          insertMany(module.seedData);
        }

        // 5. Record that this file has been successfully executed
        db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
        console.log(`  ✅ ${file} completed successfully`);
      } catch (error) {
        console.error(`  ❌ Error in ${file}:`, error.message);
        // We stop here to prevent dependent migrations from running out of order
        throw error;
      }
    }

    console.log('\n🎉 All tasks completed!');
  } catch (error) {
    console.error('💥 Process failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

runSeeds();
