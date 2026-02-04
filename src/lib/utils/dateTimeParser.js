// src\lib\utils\dateTimeParser.js

/**
 * Parse a date string into a Date object.
 * Supports: DD, DD-MM, DD-MM-YY, DD-MM-YYYY
 * Any non-alphanumeric separator is allowed.
 */
export function parseDate(input) {
  const datePattern = /^\d{1,2}(\W\d{1,2}(\W\d{2}|\W\d{4})?)?$/;
  if (!datePattern.test(input)) return null;

  const [day, month, yearPart] = input.split(/\W/);
  const date = new Date();

  if (day) date.setDate(+day);
  if (month) date.setMonth(+month - 1);

  if (yearPart) {
    date.setFullYear(normalizeYear(yearPart));
  }

  date.setHours(0, 0, 0, 0);

  return date;
}

/**
 * Parse a time string into a Date object.
 * Supports: HH, HH-MM, HH-MM-SS, optional AM/PM, any separator
 */
export function parseTime(input, date = new Date()) {
  const timePattern = /^\d{1,2}(\W\d{1,2}(\W\d{1,2})?)?\s*(a|p|am|pm)?$/i;
  if (!timePattern.test(input)) return null;

  const timeMatch = input.match(/^(\d{1,2})(?:\W(\d{1,2}))?(?:\W(\d{1,2}))?\s*(a|p|am|pm)?$/i);
  if (!timeMatch) return null;

  let [, hh, mm, ss, meridiem] = timeMatch;

  hh = Number(hh);
  mm = mm ? Number(mm) : 0;
  ss = ss ? Number(ss) : 0;

  if (meridiem) {
    meridiem = meridiem.toLowerCase();
    if (meridiem === 'p' || meridiem === 'pm') hh = (hh % 12) + 12;
    if (meridiem === 'a' || meridiem === 'am') hh = hh % 12;
  }

  date.setHours(hh);
  date.setMinutes(mm);
  date.setSeconds(ss);

  return date;
}

/**
 * Normalize 2-digit year to current century
 */
export function normalizeYear(yearPart) {
  let year = Number(yearPart);
  if (yearPart.length === 2) {
    const century = Math.floor(new Date().getFullYear() / 100) * 100;
    year = century + year;
  }
  return year;
}
