import { applyProjection } from '../base/BaseMode';

export default function AttendanceCategory(
  { id = null, name = '', fields = [], createdAt = null, updatedAt = null } = {},
  projection = {},
) {
  const allFields = {
    id,
    name,
    fields,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
