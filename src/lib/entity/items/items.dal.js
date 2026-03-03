import { connectDB } from '$lib/core/server/mongodb';
import { ObjectId } from 'mongodb';

const collectionName = 'items';

export async function fetchAllItems() {
  const db = await connectDB();
  const items = await db.collection(collectionName).find({}).toArray();
  return items;
}

export async function fetchSingleItemByName(name) {
  const db = await connectDB();
  const items = await db.collection(collectionName).findOne({ name: name });
  return items;
}

export async function insertItem(data) {
  const db = await connectDB();

  const itemDoc = {
    name: data.name ?? null,
    price_025:
      data.price_025 !== undefined && !isNaN(Number(data.price_025))
        ? Number(data.price_025)
        : null,
    price_050:
      data.price_050 !== undefined && !isNaN(Number(data.price_050))
        ? Number(data.price_050)
        : null,
    price100:
      data.price100 !== undefined && !isNaN(Number(data.price100)) ? Number(data.price100) : null,
    price150:
      data.price150 !== undefined && !isNaN(Number(data.price150)) ? Number(data.price150) : null,
    price200:
      data.price200 !== undefined && !isNaN(Number(data.price200)) ? Number(data.price200) : null,
    created_at: new Date(),
  };

  const result = await db.collection(collectionName).insertOne(itemDoc);
  return result;
}

export async function updateItemById(data, id) {
  const db = await connectDB();

  const itemDoc = {
    name: data.name ?? null,
    price_025:
      data.price_025 !== undefined && !isNaN(Number(data.price_025))
        ? Number(data.price_025)
        : null,
    price_050:
      data.price_050 !== undefined && !isNaN(Number(data.price_050))
        ? Number(data.price_050)
        : null,
    price100:
      data.price100 !== undefined && !isNaN(Number(data.price100)) ? Number(data.price100) : null,
    price150:
      data.price150 !== undefined && !isNaN(Number(data.price150)) ? Number(data.price150) : null,
    price200:
      data.price200 !== undefined && !isNaN(Number(data.price200)) ? Number(data.price200) : null,
    created_at: new Date(),
  };

  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: itemDoc,
    },
  );

  return result;
}

export async function deleteItemById(id) {
  const db = await connectDB();
  const result = await db.collection(collectionName).deleteOne({
    _id: new ObjectId(id),
  });
  return result;
}

export async function checkItemNameExists(name, id) {
  const db = await connectDB();
  return await db.collection(collectionName).findOne({
    name,
    _id: { $ne: new ObjectId(id) },
  });
}
