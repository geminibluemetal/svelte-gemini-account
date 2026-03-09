import { applyProjection } from '../base/BaseMode';

export default function Fingerprint(
  {
    id = null,
    fullNumber = null,
    shortNumber = null,
    isCompanyFingerprint = false,
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
    isCompanyFingerprint,
    bodyCapacity,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
