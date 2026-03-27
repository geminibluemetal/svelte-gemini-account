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

    //  1) Add isCleared, isHidden fields in Order collecion and set default false value
    const orderCollection = db.collection('order');
    const orderResult = await orderCollection.updateMany({},
      { $set: { isCleared: false, isHidden: false } },
    );
    console.log(`✅ Updated ${orderResult.modifiedCount} in Order`);

    //  2) Add isCleared, isHidden fields in Order collecion and set default false value
    const partyStatementCollection = db.collection('partyStatement');
    const partyStatementResult = await partyStatementCollection.updateMany({},
      { $set: { isCleared: false, isHidden: false } },
    );
    console.log(`✅ Updated ${partyStatementResult.modifiedCount} in Party Statement`);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

runAlters();
