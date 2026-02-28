import { connectDB } from '$lib/core/server/mongodb';
import { z } from 'zod';
import VehicleRepository from './VehicleRepository';
import { ObjectId } from 'mongodb';

const indianVehicleRegex = /^(?:[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}|[A-Z]{2}\d{2}\s\d{4})$/;

async function validateUniqueShortNumber(val, fullData = {}) {
  const db = await connectDB();
  const repo = new VehicleRepository(db);
  const query = { shortNumber: val };
  if (fullData.id) {
    query._id = { $ne: new ObjectId(fullData.id) };
  }
  const existing = await repo.findOne(query);
  return !existing;
}

export function vehicleSchema(isUpdate = false) {
  return z.object({
    fullNumber: z
      .string()
      .toUpperCase()
      .regex(indianVehicleRegex, {
        message: 'Invalid Indian vehicle number format. Example: TN01AB1234',
      })
      .nullable()
      .default(null),

    shortNumber: z
      .string({ required_error: 'Vehicle Number is required' })
      .trim()
      .min(4, { message: 'Vehicle Number should be at least 4 characters' })
      .refine(
        async (val, fullData) => {
          return validateUniqueShortNumber(val, isUpdate ? fullData : {});
        },
        { message: 'This Vehicle Number already exists' },
      ),

    isCompanyVehicle: z.coerce.boolean().default(false),
    bodyCapacity: z.array(z.number()).default([]),
    createdAt: z.date().optional().nullable(),
    updatedAt: z.date().optional().nullable(),
  });
}

export const vehicleCreateSchema = vehicleSchema(false);
export const vehicleUpdateSchema = vehicleSchema(true);
