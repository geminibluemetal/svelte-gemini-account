import { applyProjection } from '../base/BaseMode';

export default function Weighment(
  {
    id = null,
    emptyAt = null,
    loadAt = null,
    name = '',
    vehicle = '',
    loadWeight = 0,
    emptyWeight = 0,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    emptyAt,
    loadAt,
    name,
    vehicle,
    loadWeight,
    emptyWeight,
    netWeight: loadWeight - emptyWeight,
  };
  return applyProjection(allFields, projection);
}
