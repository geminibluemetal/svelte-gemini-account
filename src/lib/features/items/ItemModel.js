import { applyProjection } from '../base/BaseMode';

export default function Item(
  {
    id = null,
    name = null,
    price = {
      unit025: 0,
      unit050: 0,
      unit100: 0,
      unit150: 0,
      unit200: 0,
    },
    createdAt = null,
    updatedAt = null,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    name,
    price,
    createdAt,
    updatedAt,
  };

  return applyProjection(allFields, projection);
}