import { z } from 'zod';

export const cashDescriptionSchema = z.object({
  id: z.string().optional(),
  description: z.string().trim().min(1, 'Description is Required'),
});
