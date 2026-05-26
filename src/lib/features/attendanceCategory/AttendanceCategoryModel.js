import { applyProjection } from '../base/BaseMode';

export default function AttendanceCategory(
  { id = null, name = '', fields = [], calculationRule = [], createdAt = null, updatedAt = null } = {},
  projection = {},
) {
  const allFields = {
    id,
    name,
    fields,
    calculationRule,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
