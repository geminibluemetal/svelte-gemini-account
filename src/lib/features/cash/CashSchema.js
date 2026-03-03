import { z } from 'zod';

export const cashSchema = z.object({
  id: z.string().optional(),
  orderId: z.string().optional(),
  description: z.string().trim().min(1, 'Description is Required'),
  amount: z.coerce.number().default(0),
  sign: z.coerce.boolean().default(false),
  entryType: z.enum(['INCOME', 'EXPENSE']),
});
