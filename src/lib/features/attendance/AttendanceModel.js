import { applyProjection } from '../base/BaseMode';

export default function Attendance(
  {
    id = null,
    nameId = '',
    date = new Date(),
    fields = {},
    createdAt = null,
    updatedAt = null,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    nameId,
    date: new Date(date),
    fields,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
