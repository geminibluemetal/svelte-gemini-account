import { getFormattedDate, getFormattedTime } from '$lib/utils/dateTime';
import { parseTime } from '$lib/utils/dateTimeParser';
import { formatFixed, formatNumber } from '$lib/utils/number';

const formatters = {
  date: function (value) {
    return getFormattedDate(value);
  },
  time: function (value) {
    if (value.includes('T')) value = new Date(value);
    else value = parseTime(value);
    return getFormattedTime(value);
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
