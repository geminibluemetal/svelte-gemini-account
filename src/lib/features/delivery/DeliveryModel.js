import { applyProjection } from '../base/BaseMode';

export default function Delivery(
  {
    id = null, // Used in token
    serial = 1, // Used in token
    deliveredAt = null,
    paymentAt = null,
    orderNumber = null,
    partyName = null, // Used in token
    address = null,
    tokenItem = null, // Used in token
    tokenQuantity = 0, // Used in token
    deliveryItem = null,
    deliveryQuantity = 0,
    amountType1 = null,
    amountType2 = null,
    amount1 = 0,
    amount2 = 0,
    sign = false,
    hasMark = false,
    vehicle = null, // Used in token
    isCancelled = false, // Used in token
    createdAt = null, // Used in token
    updatedAt = null, // Used in token
    ...extraFields
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    serial,
    deliveredAt,
    paymentAt,
    orderNumber,
    partyName,
    address,
    tokenItem,
    tokenQuantity,
    deliveryItem,
    deliveryQuantity,
    amountType1,
    amountType2,
    amount1,
    amount2,
    sign,
    hasMark,
    vehicle,
    isCancelled,
    createdAt,
    updatedAt,
    ...extraFields,
  };
  return applyProjection(allFields, projection);
}
