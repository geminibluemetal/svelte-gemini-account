import { connectDB } from '$lib/core/server/mongodb';
import { z } from 'zod';
import VehicleRepository from './VehicleRepository';
import { ObjectId } from 'mongodb';

const indianVehicleRegex = /^(?:[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}|[A-Z]{2}\d{2}\s\d{4})$/;

/**
 * Checks database for existing shortNumber, excluding the current ID if updating.
 */
async function validateUniqueShortNumber(shortNumber, id = null) {
  const db = await connectDB();
  const repo = new VehicleRepository(db);

  const query = { shortNumber };
  if (id) {
    // Exclude the current document from the uniqueness check
    query._id = { $ne: new ObjectId(id) };
  }

  const existing = await repo.findOne(query);
  return !existing; // Returns true if unique (not found)
}

export function vehicleSchema(isUpdate = false) {
  const baseSchema = z.object({
    // We add ID to the schema so it is available during refinement
    id: z.string().optional(),

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
      .min(4, { message: 'Vehicle Number should be at least 4 characters' }),

    isCompanyVehicle: z.coerce.boolean().default(false),
    bodyCapacity: z.array(z.number()).default([]),
    createdAt: z.date().optional().nullable(),
    updatedAt: z.date().optional().nullable(),
  });

  // Use superRefine to access the whole object (data)
  return baseSchema.superRefine(async (data, ctx) => {
    const isUnique = await validateUniqueShortNumber(
      data.shortNumber,
      isUpdate ? data.id : null
    );

    if (!isUnique) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'This Vehicle Number already exists',
        path: ['shortNumber'], // Points the error to the specific field
      });
    }
  });
}

export const vehicleCreateSchema = vehicleSchema(false);
export const vehicleUpdateSchema = vehicleSchema(true);