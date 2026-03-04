import { z } from 'zod';

export const cashSchema = z.object({
  id: z.string().optional(),
  orderId: z.string().optional(),
  description: z.string().trim().min(1, 'Description is Required'),
  reference: z.string().trim().default(''),
  amount: z.coerce.number().default(0),
  sign: z.coerce.boolean().default(false),
  entryType: z.enum(['INCOME', 'EXPENSE']),
  createdAt: z.preprocess((val) => {
    val = Date.parse(val) ? new Date(val) : val;
    if (val instanceof Date) return val;
    return new Date();
  }, z.coerce.date()),
});
