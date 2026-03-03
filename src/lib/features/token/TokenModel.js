import { applyProjection } from '../base/BaseMode';

export default function Token(
  {
    id = null,
    serial = 1,
    partyName = null,
    tokenItem = null,
    tokenQuantity = 0,
    deliveryItem = null,
    deliveryQuantity = 0,
    vehicle = null,
    createdAt = null,
    updatedAt = null,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    serial,
    partyName,
    tokenItem,
    tokenQuantity,
    vehicle,
    isClosed: Boolean(deliveryItem && deliveryQuantity),
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
