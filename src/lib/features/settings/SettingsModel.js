import { applyProjection } from '../base/BaseMode';

export default function Address(
  { lastOrderNumber = 0, createdAt = null, vehicleOrder = '', updatedAt = null, weighment = {} } = {},
  projection = {},
) {
  const allFields = {
    lastOrderNumber,
    nextOrderNumber: lastOrderNumber >= 999 ? 1 : lastOrderNumber + 1,
    vehicleOrder,
    weighment,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
