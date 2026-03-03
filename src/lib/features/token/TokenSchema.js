import { z } from 'zod';

export const tokenSchema = z.object({
  id: z.string().optional(),
  partyName: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null;
    return val;
  }, z.string().trim().nullable().optional()),
  vehicle: z
    .string({ required_error: 'Vehicle is required' })
    .trim()
    .min(1, 'Vehicle cannot be empty'),
  tokenItem: z
    .string({
      required_error: 'Item is required',
    })
    .trim()
    .min(1, 'Item cannot be empty'),
  tokenQuantity: z.coerce
    .number({
      required_error: 'Quantity is required',
      invalidType_error: 'Quantity must be a number',
    })
    .positive('Quantity must be greater than 0'),
});
