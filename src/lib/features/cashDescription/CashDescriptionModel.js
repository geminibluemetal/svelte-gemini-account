import { applyProjection } from '../base/BaseMode';

export default function CashDescription(
  { id = null, description = '', createdAt = null, updatedAt = null } = {},
  projection = {},
) {
  const allFields = {
    id,
    description,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
