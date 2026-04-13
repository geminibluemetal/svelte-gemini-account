import { z } from 'zod';
import SettingsService from '../settings/SettingsService';
import OrderService from './OrderService';

export function orderSchema(isUpdate = false) {
  // 1. Define the base shape
  const schemaShape = {
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
        invalidType_error: 'Total Quantity must be a number',
      })
      .positive('Total Quantity must be greater than 0'),

    amountType: z.string(),
    amount: z.coerce.number().default(0),
    advance: z.coerce.number().default(0),
    discount: z.coerce.number().default(0),

    notes: z.string().optional().nullable(),

    paymentAt: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z
        .string()
        .datetime()
        .transform((val) => new Date(val))
        .optional(),
    ),

    // Defaults
    status: z.string().default('New'),
    sign: z.coerce.boolean().default(false),
    isCleared: z.coerce.boolean().default(false),
    isHidden: z.coerce.boolean().default(false),
    isOwnerOrder: z.coerce.boolean().default(false),
    tracktorOnly: z.coerce.boolean().default(false),
  };

  // 2. ONLY add these fields if it's NOT an update.
  // This prevents the .default(0) from overwriting synced data during updates.
  if (!isUpdate) {
    schemaShape.deliveredQty = z.coerce.number().default(0);
    schemaShape.deliverySheetVerified = z.coerce.number().default(0);
  }

  return z.object(schemaShape).superRefine(async (data, ctx) => {
    if (isUpdate) {
      const orderService = new OrderService();
      const order = await orderService.getById(data.id);
      if (order.sign) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Order can't be updated as it is already signed`,
          path: ['orderNumber'],
        });
      }
    }

    const partyMissing = !data.partyName || data.partyName.trim() === '';

    // Check for duplicate order number
    if (!isUpdate) {
      try {
        const settingsService = new SettingsService();
        const orderService = new OrderService();

        const settings = await settingsService.getSettings();
        const existingOrder = await orderService.getOrderByNumber(settings.nextOrderNumber);

        if (existingOrder) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Order number ${settings.nextOrderNumber} already exists, check old orders`,
            path: ['orderNumber'],
          });
        }
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Error validating order number: ${error.message}`,
          path: ['orderNumber'],
        });
      }
    }

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

    if (data.amountType !== 'AC' && (!data.amount || data.amount === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Amount is required for non-AC orders',
        path: ['amount'],
      });
    }
  });
}

export const orderCreateSchema = orderSchema();
export const orderUpdateSchema = orderSchema(true);
