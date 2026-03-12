import { z } from 'zod';

const weightSchema = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    return isNaN(Number(val)) ? 0 : Number(val)
  },
  z
    .number({
      invalid_type_error: "Weight must be a valid number",
      required_error: "Weight is required"
    })
    .refine((v) => !Number.isNaN(v), {
      message: "Weight must be a valid number"
    })
    .min(0, "Weight cannot be negative")
);

export const weighmentFirstSchema = z.object({
  type: z.enum(['Normal', 'Chakka']),

  vehicle: z.string().min(1, "Vehicle is required"),

  firstWeightAt: z.coerce.date(),

  firstWeight: weightSchema.default(0),

  emptyAt: z.coerce.date().nullable().default(null),

  loadAt: z.coerce.date().nullable().default(null),

  loadWeight: weightSchema.default(0),

  emptyWeight: weightSchema.default(0),
});


export const weighmentSecondSchema = z.object({
  type: z.enum(['Normal', 'Chakka']),

  vehicle: z.string().min(1, "Vehicle is required"),

  firstWeightAt: z.coerce.date().nullable().default(null),

  firstWeight: weightSchema.default(0),

  emptyAt: z.coerce.date(),

  emptyWeight: weightSchema.default(0),

  loadAt: z.coerce.date(),

  loadWeight: weightSchema.default(0),
});