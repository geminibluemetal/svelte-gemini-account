import { applyProjection } from '../base/BaseMode';

export default function Vehicle(
  {
    id = null,
    fullNumber = null,
    shortNumber = null,
    isCompanyVehicle = false,
    bodyCapacity = [],
    createdAt = null,
    updatedAt = null,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    fullNumber,
    shortNumber,
    isCompanyVehicle,
    bodyCapacity,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
