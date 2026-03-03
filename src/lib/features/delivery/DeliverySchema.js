import { z } from 'zod';
import AddressService from '../address/AddressService';
import ItemService from '../items/ItemService';

async function validateAddressDeliveryCharge(address, quantity) {
  const addressService = new AddressService();
  const checkResult = await addressService.checkAddressHasDeliveryCharge(address, quantity);
  if (!checkResult.ok) return false;
  return checkResult?.data?.hasCharge === true;
}

async function validateItemPrice(item, quantity) {
  const itemService = new ItemService();
  const checkResult = await itemService.checkItemHasPrice(item, quantity);
  if (!checkResult.ok) return false;
  return checkResult?.data?.hasPrice === true;
}

export const deliveryEntrySchema = z
  .object({
    id: z.string().optional(),
    orderNumber: z.string(),
    partyName: z.preprocess((val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    }, z.string().trim().nullable().optional()),
    address: z.preprocess(
      (val) => (val === '' ? null : val),
      z.string().trim().nullable().optional(),
    ),
    deliveryItem: z
      .string({
        required_error: 'Item is required',
      })
      .trim()
      .min(1, 'Item cannot be empty'),
    deliveryQuantity: z.coerce
      .number({
        required_error: 'Quantity is required',
        invalid_type_error: 'Quantity must be a number',
      })
      .positive('Quantity must be greater than 0'),
    amountType1: z.preprocess((val) => {
      if (val === "null" || val === "") return null;
      return val;
    }, z.string().nullable()),
    amountType2: z.preprocess((val) => {
      if (val === "null" || val === "") return null;
      return val;
    }, z.string().nullable()),
    amount1: z.coerce.number().default(0),
    amount2: z.coerce.number().default(0),
    sign: z.coerce.boolean().default(false),
    hasMark: z.coerce.boolean().default(false),
    isCancelled: z.coerce.boolean().default(false),
    vehicle: z.string().trim(),
  })
  .superRefine(async (data, ctx) => {
    const isAlredySigned = data.sign;
    const isCompanyVehicle = data.vehicle.endsWith('G');
    const isAc = data.amountType1 === 'AC' || data.amountType2 === 'AC';
    const bothAc = data.amountType1 === 'AC' && data.amountType2 === 'AC';

    if (isAlredySigned) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Can not edit Signed Delivery Record',
        path: ['sign'],
      });
    }

    if (isAc) {
      if (data.partyName === '' || data.partyName === null || data.partyName === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'AC type Must have Party Name',
          path: ['partyName'],
        });
      }

      // Checking Ignore list for items that we don't want to check price for, because its later told by HB company
      const ignoreItemList = ['6sb', '4sb'];
      if (!ignoreItemList.includes(data.deliveryItem.toLowerCase())) {
        if (data.address) {
          const isAddressHasDeliveryCharge = await validateAddressDeliveryCharge(data.address, data.deliveryQuantity);
          if (!isAddressHasDeliveryCharge) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Delivery charge is missing in Address',
              path: ['address'],
            });
          }
        }
        if (data.deliveryItem) {
          const isItemHasPrice = await validateItemPrice(data.deliveryItem, data.deliveryQuantity);
          if (!isItemHasPrice) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Price is missing in Item for the given quantity',
              path: ['item'],
            });
          }
        }
      }
    }

    if (bothAc) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Both amount type can not be AC',
        path: ['amountType2'],
      });
    }

    if (isCompanyVehicle) {
      if (data.address === '' || data.address === null || data.address === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Address is required for company vehicle',
          path: ['address'],
        });
      }
      if (data.orderNumber === '' || data.orderNumber === null || data.orderNumber === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Order number is required for company vehicle',
          path: ['orderNumber'],
        });
      }
    }
  });