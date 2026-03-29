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

/**
 * Checks database for existing phone, excluding the current ID if updating.
 */
async function validateUniquePhone(phone, id = null) {
  const db = await connectDB();
  const repo = new PartyRepository(db);

  const query = { phone };
  if (id) {
    query._id = { $ne: new ObjectId(id) };
  }

  const existing = await repo.findOne(query);
  return { isUnique: !existing, existingData: existing };
}

export function partySchema(isUpdate = false) {
  const baseSchema = z.object({
    id: z.string().optional(),
    phone: z.string().trim()
      .min(1, 'Phone number cannot be empty')
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    name: z
      .string({
        required_error: 'Party name is required',
        invalidType_error: 'Party name must be text',
      })
      .trim()
      .min(1, 'Party name cannot be empty'),
    openingBalance: z.coerce
      .number({ invalidType_error: 'Delivery Charge must be a number' })
      .min(0, 'Delivery Charge cannot be negative')
      .nullable(),
    createdAt: z.date().optional().nullable(),
    updatedAt: z.date().optional().nullable(),
  });

  return baseSchema.superRefine(async (data, ctx) => {
    // Only run DB check if phone exists to avoid redundant errors
    if (data.phone) {
      const { isUnique, existingData } = await validateUniquePhone(data.phone, isUpdate ? data.id : null);

      if (!isUnique) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `This Phone number is already linked with "${existingData.name || 'another party'}"`,
          path: ['phone'],
        });
      }
    }

    // Only run DB check if name exists to avoid redundant errors
    if (data.name) {
      const isUnique = await validateUniqueName(data.name, isUpdate ? data.id : null);

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
