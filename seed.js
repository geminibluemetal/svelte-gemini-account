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

        // 3. Handle Schema/Indexes if present (for MongoDB, this means creating indexes)
        if (module.indexes && Array.isArray(module.indexes)) {
          console.log(`  🔧 Creating indexes for '${module.collectionName}'...`);
          const collection = db.collection(module.collectionName);

          for (const index of module.indexes) {
            // index should be { spec: { field: 1 }, options: { unique: true } }
            await collection.createIndex(index.spec, index.options || {});
          }
        }

        // 4. Handle Seed Data if present
        if (module.seedData && Array.isArray(module.seedData) && module.seedData.length > 0) {
          console.log(
            `  🌱 Seeding ${module.seedData.length} records into '${module.collectionName}'...`,
          );

          const collection = db.collection(module.collectionName);

          // Handle unique fields - can be either a string or an array of strings
          const uniqueFields = module.uniqueFields || module.uniqueField;

          if (uniqueFields) {
            let fieldsArray = [];

            // Convert to array if it's a string
            if (typeof uniqueFields === 'string') {
              fieldsArray = [uniqueFields];
            } else if (Array.isArray(uniqueFields)) {
              fieldsArray = uniqueFields;
            }

            if (fieldsArray.length > 0) {
              console.log(`  🔑 Using unique fields: ${fieldsArray.join(', ')}`);

              // Use bulkWrite with updateOne for upsert to avoid duplicates
              const operations = module.seedData.map((doc) => {
                // Build filter based on unique fields
                const filter = {};
                fieldsArray.forEach((field) => {
                  filter[field] = doc[field];
                });

                return {
                  updateOne: {
                    filter: filter,
                    update: { $setOnInsert: doc },
                    upsert: true,
                  },
                };
              });

              if (operations.length > 0) {
                const result = await collection.bulkWrite(operations);
                console.log(
                  `    📊 Inserted: ${result.upsertedCount}, Updated: ${result.modifiedCount}, Matched: ${result.matchedCount}`,
                );
              }
            }
          } else {
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
        }

        // 5. Handle collection validations if present (MongoDB schema validation)
        if (module.validationRules) {
          console.log(`  🔍 Applying validation rules for '${module.collectionName}'...`);
          await db.command({
            collMod: module.collectionName,
            validator: module.validationRules.validator,
            validationLevel: module.validationRules.level || 'strict',
            validationAction: module.validationRules.action || 'error',
          });
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
