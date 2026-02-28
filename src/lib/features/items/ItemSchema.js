import { connectDB } from '$lib/core/server/mongodb';
import { z } from 'zod';
import ItemRepository from './ItemRepository';
import { ObjectId } from 'mongodb';

/**
 * Checks database for existing name, excluding the current ID if updating.
 */
async function validateUniqueName(name, id = null) {
  const db = await connectDB();
  const repo = new ItemRepository(db);

  const query = { name };
  if (id) {
    query._id = { $ne: new ObjectId(id) };
  }

  const existing = await repo.findOne(query);
  return !existing;
}

export function itemSchema(isUpdate = false) {
  const baseSchema = z.object({
    id: z.string().optional(),

    // Name validation
    name: z
      .string({
        required_error: 'Item name is required',
        invalid_type_error: 'Item name must be text'
      })
      .trim()
      .min(1, 'Item name cannot be empty'),

    // Price object validation
    price: z.object({
      unit025: z.coerce.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative').nullable(),
      unit050: z.coerce.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative').nullable(),
      unit100: z.coerce.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative').nullable(),
      unit150: z.coerce.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative').nullable(),
      unit200: z.coerce.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative').nullable(),
    }, { required_error: 'Price breakdown is required' }),

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
          message: 'This Item already exists',
          path: ['name'],
        });
      }
    }
  });
}

export const itemCreateSchema = itemSchema(false);
export const itemUpdateSchema = itemSchema(true);