import { applyProjection } from '../base/BaseMode';

export default function PartyStatement(
  {
    id = null,
    partyId = null,
    partyName = null,
    deliveryId = null,
    amountType = '',
    entryType = '',
    item = null,
    qty = 0,
    amount = 0,
    vehicle = null,
    address = null,
    sign = false,
    isCleared = false,
    isHidden = false,
    createdAt = null,
    updatedAt = null,
    ...extraFields
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    partyId,
    partyName,
    deliveryId,
    amountType,
    entryType,
    item,
    qty,
    amount,
    vehicle,
    address,
    sign,
    isCleared,
    isHidden,
    createdAt,
    updatedAt,
    ...extraFields
  };
  return applyProjection(allFields, projection);
}
