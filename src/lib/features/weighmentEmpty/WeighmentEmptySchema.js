import { z } from 'zod';

export const weighmentEmptySchema = z.object({
  vehicle: z.string().trim().min(1, 'Vehicle is Required'),
  emptyWeight: z.coerce.number().default(0),
});
