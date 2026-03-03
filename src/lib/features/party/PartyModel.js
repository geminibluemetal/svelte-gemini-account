import { applyProjection } from '../base/BaseMode';

export default function Party(
  {
    id = null,
    name = null,
    phone = null,
    openingBalance = 0.0,
    createdAt = null,
    updatedAt = null,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    name,
    phone,
    openingBalance,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
