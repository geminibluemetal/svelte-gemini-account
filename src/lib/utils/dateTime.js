/**
 * Extracts individual date and time parts from a Date object,
 * including numeric values as well as localized month and
 * weekday names.
 *
 * If no date is provided, the current date and time (`new Date()`)
 * will be used by default.
 *
 * @param {Date|string|number} [date=new Date()]
 *   JavaScript Date object or date string/timestamp to extract parts from.
 *
 * @returns {{
 *   year: string,
 *   month: string,
 *   day: string,
 *   hour: string,
 *   hour12: string,
 *   minute: string,
 *   second: string,
 *   dayPeriod: string,
 *   monthName: string,
 *   monthShort: string,
 *   weekdayName: string,
 *   weekdayShort: string,
 *   timestamp: number
 * }}
 *   An object containing formatted date/time parts.
 */
export function getDateTimeParts(date = new Date()) {
  // Ensure we have a valid Date object
  const dateObj = new Date(date);

  // Handle invalid date
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  // Get individual components
  const year = dateObj.getFullYear().toString();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  // Hours (24-hour format)
  const hours24 = dateObj.getHours();
  const hour = String(hours24).padStart(2, '0');

  // Hours (12-hour format)
  const hours12 = hours24 % 12 || 12;
  const hour12 = String(hours12).padStart(2, '0');

  const minute = String(dateObj.getMinutes()).padStart(2, '0');
  const second = String(dateObj.getSeconds()).padStart(2, '0');

  // Get AM/PM
  const dayPeriod = hours24 >= 12 ? 'PM' : 'AM';

  // Get month names
  const monthNameFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
  const monthShortFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

  // Get weekday names
  const weekdayNameFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
  const weekdayShortFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

  return {
    year,
    month,
    day,
    hour, // 24-hour format with leading zero
    hour12, // 12-hour format with leading zero
    minute,
    second,
    dayPeriod,
    monthName: monthNameFormatter.format(dateObj),
    monthShort: monthShortFormatter.format(dateObj),
    weekdayName: weekdayNameFormatter.format(dateObj),
    weekdayShort: weekdayShortFormatter.format(dateObj),
    timestamp: dateObj.getTime(),
  };
}

/**
 * Formats a Date object using a custom token-based pattern.
 *
 * Supported tokens:
 * - `YYYY` → 4-digit year (e.g., 2026)
 * - `YY`   → 2-digit year (e.g., 26)
 * - `MM`   → month (2-digit with leading zero, e.g., 03)
 * - `M`    → month (without leading zero, e.g., 3)
 * - `DD`   → day (2-digit with leading zero, e.g., 04)
 * - `D`    → day (without leading zero, e.g., 4)
 * - `HH`   → hour (24-hour format with leading zero, e.g., 09, 14)
 * - `H`    → hour (24-hour format without leading zero, e.g., 9, 14)
 * - `hh`   → hour (12-hour format with leading zero, e.g., 09, 02)
 * - `h`    → hour (12-hour format without leading zero, e.g., 9, 2)
 * - `II`   → minute (with leading zero, e.g., 05)
 * - `I`    → minute (without leading zero, e.g., 5)
 * - `SS`   → second (with leading zero, e.g., 08)
 * - `S`    → second (without leading zero, e.g., 8)
 * - `AA`   → AM/PM (uppercase)
 * - `aa`   → am/pm (lowercase)
 * - `MN`   → month name (full, e.g., January)
 * - `MS`   → month short name (e.g., Jan)
 * - `DN`   → weekday name (full, e.g., Monday)
 * - `DS`   → weekday short name (e.g., Mon)
 *
 * If no date is provided, the current date and time (`new Date()`)
 * will be used by default.
 *
 * @param {string} pattern
 *   Token-based format pattern.
 *
 * @param {Date|string|number} [date=new Date()]
 *   JavaScript Date object or date string/timestamp to format.
 *
 * @returns {string}
 *   Formatted date/time string.
 *
 * @example
 * formatDateTime('DD-MM-YYYY HH:II AA', new Date())
 * // "23-08-2026 10:30 AM"
 *
 * @example
 * formatDateTime('MN DD, YYYY', new Date())
 * // "January 23, 2026"
 */
export function formatDateTime(pattern = '', date = new Date()) {
  if (!pattern) return '';

  const p = getDateTimeParts(date);

  const tokens = {
    YYYY: p.year,
    YY: p.year.slice(-2),
    MM: p.month,
    M: parseInt(p.month).toString(),
    DD: p.day,
    D: parseInt(p.day).toString(),
    HH: p.hour,
    H: parseInt(p.hour).toString(),
    hh: p.hour12,
    h: parseInt(p.hour12).toString(),
    II: p.minute,
    I: parseInt(p.minute).toString(),
    SS: p.second,
    S: parseInt(p.second).toString(),
    AA: p.dayPeriod,
    aa: p.dayPeriod.toLowerCase(),
    MN: p.monthName,
    MS: p.monthShort,
    DN: p.weekdayName,
    DS: p.weekdayShort,
  };

  // 1. Create a regex that matches any of the keys
  // Sort by length desc (like you did) to match 'YYYY' before 'YY'
  const patternKeys = Object.keys(tokens).sort((a, b) => b.length - a.length);
  const regex = new RegExp(patternKeys.join('|'), 'g');

  // 2. Use the replacer function to do it in ONE pass
  return pattern.replace(regex, (matched) => {
    return tokens[matched];
  });
}

/**
 * Returns commonly used formatted date and time strings
 * for a given Date object.
 *
 * If no date is provided, the current date and time (`new Date()`)
 * will be used by default.
 *
 * @param {Date|string|number} [date=new Date()]
 *   JavaScript Date object or date string/timestamp to format.
 *
 * @returns {{
 *   date: string,
 *   time: string,
 *   datetime: string,
 *   iso: string
 * }}
 *   An object containing formatted strings.
 */
export function getDefaultDateTimeFormat(date = new Date()) {
  const dateObj = new Date(date);

  return {
    date: formatDateTime('DD-MM-YYYY', dateObj),
    time: formatDateTime('hh:II AA', dateObj),
    datetime: formatDateTime('DD-MM-YYYY hh:II AA', dateObj),
    iso: dateObj.toISOString(),
  };
}

/**
 * Returns a formatted date string.
 *
 * Format: `DD-MM-YYYY`
 *
 * If no date is provided, the current date (`new Date()`)
 * will be used by default.
 *
 * @param {Date|string|number} [date=new Date()]
 *   JavaScript Date object or date string/timestamp to format.
 *
 * @returns {string}
 *   Formatted date string.
 */
export function getFormattedDate(date = new Date()) {
  return formatDateTime('DD-MM-YYYY', date);
}

/**
 * Returns a formatted time string.
 *
 * Format: `hh:II AA` (12-hour format with AM/PM)
 *
 * If no date is provided, the current time (`new Date()`)
 * will be used by default.
 *
 * @param {Date|string|number} [date=new Date()]
 *   JavaScript Date object or date string/timestamp to format.
 *
 * @returns {string}
 *   Formatted time string.
 */
export function getFormattedTime(date = new Date()) {
  return formatDateTime('hh:II AA', date);
}

/**
 * Returns a formatted timestamp string.
 *
 * Format: `DD-MM-YYYY hh:II AA`
 *
 * If no date is provided, the current date and time (`new Date()`)
 * will be used by default.
 *
 * @param {Date|string|number} [date=new Date()]
 *   JavaScript Date object or date string/timestamp to format.
 *
 * @returns {string}
 *   Formatted timestamp string.
 */
export function getFormattedTimestamp(date = new Date()) {
  return formatDateTime('DD-MM-YYYY hh:II AA', date);
}

/**
 * Returns a formatted date string in ISO format (YYYY-MM-DD).
 *
 * Useful for database storage or URL parameters.
 *
 * @param {Date|string|number} [date=new Date()]
 *   JavaScript Date object or date string/timestamp to format.
 *
 * @returns {string}
 *   ISO formatted date string (YYYY-MM-DD)
 */
export function getISODate(date = new Date()) {
  const dateObj = new Date(date);
  return dateObj.toISOString().split('T')[0];
}

/**
 * Parses a date string in DD-MM-YYYY format back to a Date object.
 *
 * @param {string} dateStr
 *   Date string in DD-MM-YYYY format.
 *
 * @returns {Date}
 *   JavaScript Date object.
 *
 * @example
 * parseDateString('23-08-2026')
 * // returns Date object for August 23, 2026
 */
export function parseDateString(dateStr) {
  if (!dateStr) return new Date();

  // Handle DD-MM-YYYY format
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Handle YYYY-MM-DD format (ISO)
  const isoParts = dateStr.split('-');
  if (isoParts.length === 3 && isoParts[0].length === 4) {
    const [year, month, day] = isoParts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Fallback to default parsing
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return parsed;
}

/**
 * Checks if a date is valid.
 *
 * @param {Date|string|number} date
 *   Date to check.
 *
 * @returns {boolean}
 *   True if date is valid, false otherwise.
 */
export function isValidDate(date) {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}
