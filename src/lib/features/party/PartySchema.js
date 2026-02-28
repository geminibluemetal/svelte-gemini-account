import { connectDB } from '$lib/core/server/mongodb';
import { z } from 'zod';
import PartyRepository from './PartyRepository';
import { ObjectId } from 'mongodb';

/**
 * Checks database for existing name, excluding the current ID if updating.
 */
async function validateUniqueName(name, id = null) {
  const db = await connectDB();
  const repo = new PartyRepository(db);

  const query = { name };
  if (id) {
    query._id = { $ne: new ObjectId(id) };
  }

  const existing = await repo.findOne(query);
  return !existing;
}

export function partySchema(isUpdate = false) {
  const baseSchema = z.object({
    id: z.string().optional(),
    name: z
      .string({
        required_error: 'Party name is required',
        invalid_type_error: 'Party name must be text'
      })
      .trim()
      .min(1, 'Party name cannot be empty'),
    phone: z.preprocess(
      (val) => (val === '' ? null : val),
      z.string()
        .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
        .nullable()
    ),
    openingBalance: z.coerce.number({ invalid_type_error: 'Delivery Charge must be a number' }).min(0, 'Delivery Charge cannot be negative').nullable(),
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
          message: 'This Party already exists',
          path: ['name'],
        });
      }
    }
  });
}

export const partyCreateSchema = partySchema(false);
export const partyUpdateSchema = partySchema(true);