// src/lib/utils/dateTime.js

/**
 * Extracts individual date and time parts from a Date object,
 * including numeric values as well as localized month and
 * weekday names.
 *
 * Internally uses `Intl.DateTimeFormat.formatToParts()` to ensure
 * reliable and locale-aware parsing.
 *
 * If no date is provided, the current date and time (`new Date()`)
 * will be used by default.
 *
 * @param {Date} [date=new Date()]
 *   JavaScript Date object to extract parts from.
 *
 * @returns {{
 *   year: string,
 *   month: string,
 *   day: string,
 *   hour: string,
 *   minute: string,
 *   second: string,
 *   dayPeriod: string,
 *   monthName: string,
 *   monthShort: string,
 *   weekdayName: string,
 *   weekdayShort: string
 * }}
 *   An object containing formatted date/time parts.
 */
export function getDateTimeParts(date = new Date()) {
  const baseFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const monthNameFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long'
  });

  const monthShortFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short'
  });

  const weekdayNameFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long'
  });

  const weekdayShortFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short'
  });

  const baseParts = baseFormatter.formatToParts(date);
  const result = {};

  for (const part of baseParts) {
    if (part.type !== 'literal') {
      result[part.type] = part.value;
    }
  }

  // Add month & weekday names
  result.monthName = monthNameFormatter.format(date);
  result.monthShort = monthShortFormatter.format(date);
  result.weekdayName = weekdayNameFormatter.format(date);
  result.weekdayShort = weekdayShortFormatter.format(date);

  return result;
}

/**
 * Formats a Date object using a custom token-based pattern.
 *
 * Supported tokens:
 * - `YY` → year
 * - `MM` → month (2-digit)
 * - `DD` → day (2-digit)
 * - `HH` → hour (12-hour)
 * - `II` → minute
 * - `SS` → second
 * - `AA` → AM / PM
 * - `MN` → month name (e.g. January)
 * - `MS` → month short name (e.g. Jan)
 * - `DN` → weekday name (e.g. Monday)
 * - `DS` → weekday short name (e.g. Mon)
 *
 * If no date is provided, the current date and time (`new Date()`)
 * will be used by default.
 *
 * @param {string} pattern
 *   Token-based format pattern.
 *
 * @param {Date} [date=new Date()]
 *   JavaScript Date object to format.
 *
 * @returns {string}
 *   Formatted date/time string.
 *
 * @example
 * formatDateTime('DD-MM-YY HH:II AA')
 * // "23-08-2001 10:30 AM"
 */
export function formatDateTime(pattern = '', date = new Date()) {
  const p = getDateTimeParts(new Date(date));

  const tokens = {
    YY: p.year,
    MM: p.month,
    DD: p.day,
    HH: p.hour,
    II: p.minute,
    SS: p.second,
    AA: p.dayPeriod,

    // Month and Weekday name
    MN: p.monthName,
    MS: p.monthShort,
    DN: p.weekdayName,
    DS: p.weekdayShort
  };

  let output = pattern;

  // Replace tokens (use regexp to avoid conflicts)
  for (const token in tokens) {
    const regex = new RegExp(token, 'g');
    output = output.replace(regex, tokens[token]);
  }

  return output;
}

/**
 * Returns commonly used formatted date and time strings
 * for a given Date object.
 *
 * If no date is provided, the current date and time (`new Date()`)
 * will be used by default.
 *
 * @param {Date} [date=new Date()]
 *   JavaScript Date object to format.
 *
 * @returns {{
 *   date: string,
 *   time: string
 * }}
 *   An object containing:
 *   - `date` → formatted date (DD-MM-YY)
 *   - `time` → formatted time (HH:II AA)
 */
export function getDefaultDateTimeFormat(date = new Date()) {
  return {
    date: formatDateTime('DD-MM-YY', date),
    time: formatDateTime('HH:II AA', date)
  };
}

/**
 * Returns a formatted date string.
 *
 * Format: `DD-MM-YY`
 *
 * If no date is provided, the current date (`new Date()`)
 * will be used by default.
 *
 * @param {Date} [date=new Date()]
 *   JavaScript Date object to format.
 *
 * @returns {string}
 *   Formatted date string.
 */
export function getFormattedDate(date = new Date()) {
  return formatDateTime('DD-MM-YY', date);
}

/**
 * Returns a formatted time string.
 *
 * Format: `HH:II AA`
 *
 * If no date is provided, the current time (`new Date()`)
 * will be used by default.
 *
 * @param {Date} [date=new Date()]
 *   JavaScript Date object to format.
 *
 * @returns {string}
 *   Formatted time string.
 */
export function getFormattedTime(date = new Date()) {
  return formatDateTime('HH:II AA', date);
}

export function getFormattedTimeStamp(date = new Date()) {
  return formatDateTime('DD-MM-YY HH:II AA', date);
}
