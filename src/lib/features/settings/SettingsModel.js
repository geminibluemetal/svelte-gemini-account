import { applyProjection } from '../base/BaseMode';

export default function Address(
  { lastOrderNumber = 0, createdAt = null, updatedAt = null } = {},
  projection = {},
) {
  const allFields = {
    lastOrderNumber,
    nextOrderNumber: lastOrderNumber >= 999 ? 1 : lastOrderNumber + 1,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
