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

    const cashDescriptionCollection = await db.collection('cashDescription');
    const result = await cashDescriptionCollection.deleteMany({ description: { $regex: /(Driver|Diver|Cleaner|Crusher)$/ } });
    console.log(`✅ Updated ${result.deletedCount} in Cash Description`);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

runAlters();
