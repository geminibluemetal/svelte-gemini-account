import { MongoClient } from 'mongodb';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'Svelte-Gemini-App-Dev';

async function runAlters() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('📦 Connected to MongoDB');

    const db = client.db(DB_NAME);
    const itemsCollection = db.collection('items');

    // 1. Update items where name is '6sb' or '4sb'
    // Added braces around the query operators and $set for the update
    const bricksResult = await itemsCollection.updateMany(
      { name: { $in: ['6sb', '4sb'] } },
      { $set: { category: 'Bricks' } },
    );
    console.log(`✅ Updated ${bricksResult.modifiedCount} items to Bricks`);

    // 2. Update items where name is NOT '6sb' or '4sb'
    // Corrected $notin to $nin
    const crusherResult = await itemsCollection.updateMany(
      { name: { $nin: ['6sb', '4sb'] } },
      { $set: { category: 'Crusher' } },
    );
    console.log(`✅ Updated ${crusherResult.modifiedCount} items to Crusher`);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

runAlters();
