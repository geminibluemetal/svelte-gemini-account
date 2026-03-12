import { applyProjection } from '../base/BaseMode';

export default function WeighmentEmpty(
  {
    id = null,
    vehicle = '',
    emptyWeight = 0,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    vehicle,
    emptyWeight,
  };
  return applyProjection(allFields, projection);
}
