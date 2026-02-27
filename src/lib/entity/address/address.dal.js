import { connectDB } from '$lib/core/server/mongodb';
import { ObjectId } from 'mongodb';

const collectionName = 'address';

export async function fetchAllAddress() {
  const db = await connectDB();
  const addresss = await db.collection(collectionName).find({}).toArray();
  return addresss;
}

export async function fetchSingleAddressByName(name) {
  const db = await connectDB();
  const address = await db.collection(collectionName).findOne({ name: name });
  return address;
}

export async function insertAddress(data) {
  const db = await connectDB();

  const addressDoc = {
    name: data.name ?? null,
    delivery_025: data.delivery_025 !== undefined && !isNaN(Number(data.delivery_025)) ? Number(data.delivery_025) : null,
    delivery_050_100: data.delivery_050_100 !== undefined && !isNaN(Number(data.delivery_050_100)) ? Number(data.delivery_050_100) : null,
    delivery_max: data.delivery_max !== undefined && !isNaN(Number(data.delivery_max)) ? Number(data.delivery_max) : null,
    created_at: new Date(),
  };

  const result = await db.collection(collectionName).insertOne(addressDoc);
  return result;
}

export async function updateAddressById(data, id) {
  const db = await connectDB();

  const addressDoc = {
    name: data.name ?? null,
    delivery_025: data.delivery_025 !== undefined && !isNaN(Number(data.delivery_025)) ? Number(data.delivery_025) : null,
    delivery_050_100: data.delivery_050_100 !== undefined && !isNaN(Number(data.delivery_050_100)) ? Number(data.delivery_050_100) : null,
    delivery_max: data.delivery_max !== undefined && !isNaN(Number(data.delivery_max)) ? Number(data.delivery_max) : null,
  };

  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: addressDoc,
    },
  );

  return result;
}

export async function deleteAddressById(id) {
  const db = await connectDB();
  const result = await db.collection(collectionName).deleteOne({
    _id: new ObjectId(id),
  });
  return result;
}

export async function checkAddressNameExists(name, id) {
  const db = await connectDB();
  return await db.collection(collectionName).findOne({
    name,
    _id: { $ne: new ObjectId(id) },
  });
}
