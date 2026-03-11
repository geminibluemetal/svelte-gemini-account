import { z } from 'zod';

export const weighmentSchema = z.object({
  name: z.string().default(''),
  vehicle: z.string(),
  emptyAt: z.date(),
  loadAt: z.date(),
  loadWeight: z.coerce.number().default(0),
  emptyWeight: z.coerce.number().default(0),
});
