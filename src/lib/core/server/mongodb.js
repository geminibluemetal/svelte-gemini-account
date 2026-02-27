import { MongoClient } from 'mongodb';

import { MONGODB_URI, DB_NAME } from '$env/static/private';

let client;
let db;

export async function connectDB() {
  console.log('Connecting to:', MONGODB_URI);
  console.log('Using DB:', DB_NAME);
  if (db) return db;

  client = new MongoClient(MONGODB_URI);
  await client.connect();

  db = client.db(DB_NAME);

  console.log('MongoDB connected');
  return db;
}

export function getDB() {
  if (!db) throw new Error('Call connectDB first');
  return db;
}

process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});
