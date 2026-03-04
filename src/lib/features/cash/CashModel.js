import { applyProjection } from '../base/BaseMode';

export default function Cash(
  {
    id = null,
    orderId = null,
    amount = 0,
    description = '',
    reference = '',
    entryType = null,
    sign = false,
    createdAt = null,
    updatedAt = null,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    orderId,
    amount,
    description,
    reference,
    entryType,
    sign,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
