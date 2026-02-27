import { connectDB } from '$lib/core/server/mongodb';
import { z } from 'zod';
import VehicleRepository from './VehicleRepository';

const indianVehicleRegex = /^(?:[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}|[A-Z]{2}\d{2}\s\d{4})$/; // TN12BX9898

export const vehicleSchema = z.object({
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
    .trim() // Removes accidental spaces
    .min(4, { message: 'Vehicle Number should be At least 4 characters' }) // Note the object syntax
    .refine(
      async (val) => {
        // Check if the record exists in the DB
        const db = await connectDB();
        const repo = new VehicleRepository(db);
        const existing = await repo.findOne({ shortNumber: val });
        return !existing;
      },
      { message: 'This Vehicle Number is already exist' },
    ),
  isCompanyVehicle: z.coerce.boolean().default(false),
  bodyCapacity: z.array(z.number()).default([]),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});
