import { applyProjection } from '../base/BaseMode';

export default function CashReportReport(
  {
    id = null,
    createdAt = null,
    updatedAt = null,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
