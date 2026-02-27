import { connectDB } from '$lib/core/server/mongodb';
import { ObjectId } from 'mongodb';

const collectionName = 'party';

export async function fetchAllParty() {
  const db = await connectDB();
  const partys = await db.collection(collectionName).find({}).toArray();
  return partys;
}

export async function fetchSinglePartyByName(name) {
  const db = await connectDB();
  const party = await db.collection(collectionName).findOne({ name: name });
  return party;
}

export async function insertParty(data) {
  const db = await connectDB();

  const partyDoc = {
    name: data.name ?? null,
    phone: data.phone ?? null,
    opening_balance: data.opening_balance !== undefined && !isNaN(Number(data.opening_balance)) ? Number(data.opening_balance) : 0,
    created_at: new Date(),
  };

  const result = await db.collection(collectionName).insertOne(partyDoc);
  return result;
}

export async function updatePartyById(data, id) {
  const db = await connectDB();

  const partyDoc = {
    name: data.name ?? null,
    phone: data.phone ?? null,
    opening_balance: data.opening_balance !== undefined && !isNaN(Number(data.opening_balance)) ? Number(data.opening_balance) : 0,
  };

  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: partyDoc,
    },
  );

  return result;
}

export async function deletePartyById(id) {
  const db = await connectDB();
  const result = await db.collection(collectionName).deleteOne({
    _id: new ObjectId(id),
  });
  return result;
}

export async function checkPartyNameExists(name, id) {
  const db = await connectDB();
  return await db.collection(collectionName).findOne({
    name,
    _id: { $ne: new ObjectId(id) },
  });
}
