import { applyProjection } from '../base/BaseMode';

export default function Weighment(
  {
    id = null,
    emptyAt = null,
    loadAt = null,
    firstWeightAt = null,
    type = '',
    vehicle = '',
    loadWeight = 0,
    firstWeight = 0,
    emptyWeight = 0,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    emptyAt,
    loadAt,
    firstWeightAt,
    type,
    vehicle,
    loadWeight,
    firstWeight,
    emptyWeight,
    netWeight: loadWeight - emptyWeight,
  };
  return applyProjection(allFields, projection);
}
