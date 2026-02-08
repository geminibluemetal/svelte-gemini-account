import { getFormattedDate } from '$lib/utils/dateTime';
import { formatFixed, formatNumber } from '$lib/utils/number';

const formatters = {
  date: function (value) {
    return getFormattedDate(value);
  },
  currency: function (value) {
    return formatNumber(value);
  },
  decimal: function (value) {
    return formatFixed(value);
  },
  boolean: function (value) {
    return value ? '✓' : '✕';
  }
};

export default function display(format, value) {
  if (formatters[format]) {
    return formatters[format](value);
  }
  return value;
}
