import { connectDB } from '$lib/core/server/mongodb';
import { z } from 'zod';
import AddressRepository from './AddressRepository';
import { ObjectId } from 'mongodb';

/**
 * Checks database for existing name, excluding the current ID if updating.
 */
async function validateUniqueName(name, id = null) {
  const db = await connectDB();
  const repo = new AddressRepository(db);

  const query = { name };
  if (id) {
    query._id = { $ne: new ObjectId(id) };
  }

  const existing = await repo.findOne(query);
  return !existing;
}

export function addressSchema(isUpdate = false) {
  const baseSchema = z.object({
    id: z.string().optional(),

    // Name validation
    name: z
      .string({
        required_error: 'Address name is required',
        invalid_type_error: 'Address name must be text'
      })
      .trim()
      .min(1, 'Address name cannot be empty'),

    // Price object validation
    deliveryCharges: z.object({
      chargeHalf: z.coerce.number({ invalid_type_error: 'Delivery Charge must be a number' }).min(0, 'Delivery Charge cannot be negative').nullable(),
      chargeSingle: z.coerce.number({ invalid_type_error: 'Delivery Charge must be a number' }).min(0, 'Delivery Charge cannot be negative').nullable(),
      chargeMax: z.coerce.number({ invalid_type_error: 'Delivery Charge must be a number' }).min(0, 'Delivery Charge cannot be negative').nullable(),
    }, { required_error: 'Delivery Charges breakdown is required' }),

    createdAt: z.date().optional().nullable(),
    updatedAt: z.date().optional().nullable(),
  });

  return baseSchema.superRefine(async (data, ctx) => {
    // Only run DB check if name exists to avoid redundant errors
    if (data.name) {
      const isUnique = await validateUniqueName(
        data.name,
        isUpdate ? data.id : null
      );

      if (!isUnique) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'This Address already exists',
          path: ['name'],
        });
      }
    }
  });
}

export const addressCreateSchema = addressSchema(false);
export const addressUpdateSchema = addressSchema(true);