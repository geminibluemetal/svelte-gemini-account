import { z } from 'zod';

export function orderSchema() {
  return z
    .object({
      id: z.string().optional(),

      // Party Name (can be null or empty)
      partyName: z.preprocess((val) => {
        if (val === '' || val === null || val === undefined) return null;
        return val;
      }, z.string().trim().nullable().optional()),

      address: z.preprocess(
        (val) => (val === '' ? null : val),
        z.string().trim().nullable().optional(),
      ),

      phone: z.preprocess(
        (val) => (val === '' ? null : val),
        z
          .string()
          .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
          .nullable()
          .optional(),
      ),

      // Required Fields
      item: z
        .string({
          required_error: 'Item is required',
        })
        .trim()
        .min(1, 'Item cannot be empty'),

      totalQty: z.coerce
        .number({
          required_error: 'Total Quantity is required',
          invalid_type_error: 'Total Quantity must be a number',
        })
        .positive('Total Quantity must be greater than 0'),
      amountType: z.string(),
      amount: z.coerce.number().default(0),
      advance: z.coerce.number().default(0),
      discount: z.coerce.number().default(0),
      deliveredQty: z.coerce.number().default(0),
      notes: z.string().optional().nullable(),

      // Defaults
      status: z.string().default('New'),
      sign: z.coerce.boolean().default(false),
      isOwnerOrder: z.coerce.boolean().default(false),
      tracktorOnly: z.coerce.boolean().default(false),
      deliverySheetVerified: z.coerce.number().default(0),
    })
    .superRefine((data, ctx) => {
      const partyMissing = !data.partyName || data.partyName.trim() === '';

      /**
       * RULE:
       * If partyName is empty/null,
       * then address and phone are mandatory
       */
      if (partyMissing) {
        if (!data.address || data.address.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Address is required when party name is not provided',
            path: ['address'],
          });
        }

        if (!data.phone) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number is required when party name is not provided',
            path: ['phone'],
          });
        }

        if (data.amountType == 'AC') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Party Name is Required for AC type',
            path: ['amountType'],
          });
        }
      }
    });
}

export const orderCreateSchema = orderSchema();
export const orderUpdateSchema = orderSchema();
