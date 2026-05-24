import { applyProjection } from '../base/BaseMode';

export default function AttendanceName(
  { id = null, name = '', categoryId = null, dayFee = 0, overallAdvance = 0, createdAt = null, updatedAt = null } = {},
  projection = {},
) {
  const allFields = {
    id,
    name,
    categoryId,
    dayFee,
    overallAdvance,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
