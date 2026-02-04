// src\lib\utils\relativeTime.js

export function timeAgo(date = new Date(), comparableDate = new Date(), locale = 'en') {
  date = new Date(date)
  const now = new Date(comparableDate);
  const diffSec = (date - now) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const units = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1]
  ];

  for (const [unit, sec] of units) {
    const v = diffSec / sec;
    if (Math.abs(v) >= 1) {
      return rtf.format(Math.round(v), unit);
    }
  }

  return 'just now';
}

/**
 * Today / Yesterday / Tomorrow — exact logic
 */
export function timeAgoSmart(date, comparableDate = new Date(), locale = 'en') {
  const now = new Date(comparableDate);
  const d1 = new Date(date).setHours(0, 0, 0, 0);
  const d2 = new Date(now).setHours(0, 0, 0, 0);
  const diffDays = (d1 - d2) / (24 * 60 * 60 * 1000);

  // if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';

  return timeAgo(date, comparableDate, locale);
}
