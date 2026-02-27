import { connectDB } from "$lib/core/server/mongodb";

const collectionName = 'settings';

export async function fetchSettings() {
  const db = await connectDB()
  const settings = await db.collection(collectionName).findOne({});
  return settings;
}

export async function setSettings(settingsObj) {
  if (!settingsObj || typeof settingsObj !== 'object') {
    throw new Error('Settings must be an object');
  }

  const db = await await connectDB();
  const existingSettings = await db.collection(collectionName).findOne({});

  if (!existingSettings) {
    // If no settings exist, insert new document
    const result = await db.collection(collectionName).insertOne({
      ...settingsObj,
      created_at: new Date()
    });
    return result;
  } else {
    // Update existing document with all fields from settingsObj
    const result = await db.collection(collectionName).updateOne(
      { _id: existingSettings._id },
      {
        $set: {
          ...settingsObj
        }
      }
    );
    return result;
  }
}