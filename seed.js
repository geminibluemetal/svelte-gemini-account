import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'Svelte-Gemini-App-Dev';

async function runSeeds() {
  console.log('🚀 Starting database seeding...');

  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('📦 Connected to MongoDB');

    const db = client.db(DB_NAME);

    // 1. Create a migrations collection if it doesn't exist
    const migrationsCollection = db.collection('_migrations');

    // Create unique index on name to prevent duplicates
    await migrationsCollection.createIndex({ name: 1 }, { unique: true });

    const seedDir = path.join(__dirname, 'seed');
    const files = await fs.readdir(seedDir);
    const seedFiles = files.filter((file) => file.endsWith('.js') && file !== 'index.js').sort();

    console.log(`📁 Found ${seedFiles.length} potential seed/migration files`);

    for (const file of seedFiles) {
      // 2. Check if this specific file has already been run
      const alreadyRun = await migrationsCollection.findOne({ name: file });

      if (alreadyRun) {
        console.log(`  ⏭️  Skipping: ${file} (Already executed)`);
        continue;
      }

      console.log(`\n📄 Processing: ${file}`);
      const filePath = path.join(seedDir, file);
      const fileUrl = pathToFileURL(filePath).href;

      try {
        const module = await import(fileUrl);

        // Validation for MongoDB
        if (!module.collectionName) {
          console.log(`  ⚠️  Skipping: ${file} is missing 'collectionName' export`);
          continue;
        }

        // 4. Handle Seed Data if present
        if (module.seedData && Array.isArray(module.seedData) && module.seedData.length > 0) {
          console.log(
            `  🌱 Seeding ${module.seedData.length} records into '${module.collectionName}'...`,
          );

          const collection = db.collection(module.collectionName);

          // Simple insert with duplicate prevention
          try {
            const result = await collection.insertMany(module.seedData, { ordered: false });
            console.log(`    📊 Inserted: ${result.insertedCount} records`);
          } catch (error) {
            // Ignore duplicate key errors if they occur
            if (error.code === 11000) {
              console.log(
                `    ⚠️  Some records were duplicates (${error.result?.nInserted || 0} inserted)`,
              );
            } else {
              throw error;
            }
          }
        }

        // 6. Record that this file has been successfully executed
        await migrationsCollection.insertOne({
          name: file,
          executedAt: new Date(),
        });

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
    if (client) {
      await client.close();
      console.log('📦 Disconnected from MongoDB');
    }
  }
}

runSeeds();
