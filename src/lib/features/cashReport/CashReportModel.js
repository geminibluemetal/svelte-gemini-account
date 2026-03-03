import { applyProjection } from '../base/BaseMode';

export default function CashReportReport(
  {
    id = null,
    orderId = null,
    amount = 0,
    description = '',
    entryType = null,
    sign = false,
    createdAt = null,
    updatedAt = null,
  } = {},
  projection = {},
) {
  const allFields = {
    id,
    orderId,
    amount,
    description,
    entryType,
    sign,
    createdAt,
    updatedAt,
  };
  return applyProjection(allFields, projection);
}
