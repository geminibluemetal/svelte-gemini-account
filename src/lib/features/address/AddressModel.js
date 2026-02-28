import { applyProjection } from '../base/BaseMode';

export default function Address(
  {
    id = null,
    name = null,
    deliveryCharges = {
      chargeHalf: 0,
      chargeSingle: 0,
      chargeMax: 0,
    },
    createdAt = null,
    updatedAt = null,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    name,
    deliveryCharges,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
