import { z } from 'zod';

export const partyStatementSchema = z.object({
  id: z.string().optional(),
  partyId: z.string().optional(),
  deliveryId: z.string().optional(),
  amountType: z.string().trim().default(''),
  entryType: z.enum(['CREDIT', 'DEBIT']),
  item: z.string().trim().optional(),
  qty: z.coerce
    .number({
      invalidType_error: 'Total Quantity must be a number',
    })
    .positive('Total Quantity must be greater than 0')
    .optional()
    .default(0),
  amount: z.coerce.number().default(0),
  vehicle: z.string().optional().nullable(),
  address: z.string().trim().nullable().optional(),
  sign: z.coerce.boolean().default(false),
});
