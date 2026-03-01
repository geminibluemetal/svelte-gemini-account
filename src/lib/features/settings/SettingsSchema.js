import { z } from 'zod';

export const settingsSchema = z.object({
  id: z.string().optional(),
  lastOrderNumber: z.coerce
    .number({ invalid_type_error: 'Last Order Number must be a number' })
    .min(0, 'Last Order Number cannot be negative')
    .default(0),
});
