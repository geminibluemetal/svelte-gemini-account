import { connectDB } from '$lib/core/server/mongodb';
import { ObjectId } from 'mongodb';

const collectionName = 'vehicle';

export async function fetchAllVehicle() {
  const db = await connectDB();
  const vehicles = await db.collection(collectionName).find({}).toArray();
  return vehicles;
}

export async function fetchSingleVehicleByShortName(short_number) {
  const db = await connectDB();
  const vehicle = await db.collection(collectionName).findOne({ short_number: short_number });
  return vehicle;
}

export async function insertVehicle(data) {
  const db = await connectDB();

  const vehicleDoc = {
    full_number: data.full_number ?? null,
    short_number: data.short_number,
    is_company_vehicle: Boolean(data.is_company_vehicle),
    body_capacity: data.body_capacity !== undefined ? Number(data.body_capacity) : null,
    created_at: new Date(),
  };

  const result = await db.collection(collectionName).insertOne(vehicleDoc);
  return result;
}

export async function updateVehicleById(data, id) {
  const db = await connectDB();

  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        full_number: data.full_number ?? null,
        short_number: data.short_number,
        is_company_vehicle: Boolean(data.is_company_vehicle),
        body_capacity: data.body_capacity !== undefined ? Number(data.body_capacity) : null,
      },
    },
  );

  return result;
}

export async function deleteVehicleById(id) {
  const db = await connectDB();
  const result = await db.collection(collectionName).deleteOne({
    _id: new ObjectId(id),
  });
  return result;
}

export async function checkVehicleShortNameExists(short_number, id) {
  const db = await connectDB();
  return await db.collection(collectionName).findOne({
    short_number,
    _id: { $ne: new ObjectId(id) },
  });
}
