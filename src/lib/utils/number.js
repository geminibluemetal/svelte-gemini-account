// number.js

/**
 * Format a number according to the given locale.
 *
 * @param {number} n - The number to format.
 * @param {string} [locale='en-IN'] - Locale code for formatting.
 * @returns {string} Formatted number.
 *
 * @example
 * formatNumber(1234567); // "12,34,567"
 */
export const formatNumber = (n, locale = 'en-IN') => new Intl.NumberFormat(locale).format(n);

/**
 * Format a number using compact notation.
 * Produces values like "1.2K" or "1.2 Thousand".
 *
 * @param {number} n - The number to format.
 * @param {string} [locale='en-IN'] - Locale code.
 * @param {boolean} [long=false] - Whether to use long names ("Thousand") instead of short ("K").
 * @returns {string} Compact formatted number.
 *
 * @example
 * formatCompact(1500);           // "1.5K"
 * formatCompact(1500, 'en-IN', true); // "1.5 thousand"
 */
export const formatCompact = (n, locale = 'en-IN', long = false) =>
  new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: long ? 'long' : 'short'
  }).format(n);

/**
 * Format a number as currency.
 *
 * @param {number} n - The amount.
 * @param {string} [currency='INR'] - Currency code.
 * @param {string} [locale='en-IN'] - Locale code.
 * @returns {string} Formatted currency string.
 *
 * @example
 * formatCurrency(1500); // "₹1,500.00"
 */
export const formatCurrency = (n, showDigit = false, currency = 'INR', locale = 'en-IN') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: showDigit ? 2 : 0
  }).format(n);

/**
 * Format a number as a percentage.
 *
 * @param {number} n - The number to format (e.g., 0.25 = 25%).
 * @param {string} [locale='en-IN'] - Locale code.
 * @returns {string} Formatted percent string.
 *
 * @example
 * formatPercent(0.256); // "25.6%"
 */
export const formatPercent = (n, locale = 'en-IN') =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 2
  }).format(n);

/**
 * Format a number as an ordinal value (1st, 2nd, 3rd...).
 *
 * @param {number} n - The number to format.
 * @param {string} [locale='en-IN'] - Locale code.
 * @returns {string} Ordinal formatted string.
 *
 * @example
 * formatOrdinal(21); // "21st"
 */
export const formatOrdinal = (n, locale = 'en-IN') =>
  new Intl.NumberFormat(locale, {
    style: 'ordinal'
  }).format(n);

/**
 * Format a number with fixed decimal places using locale rules.
 *
 * @param {number} n - The number to format.
 * @param {number} [digits=2] - Decimal places.
 * @param {string} [locale='en-IN'] - Locale code.
 * @returns {string} Number with fixed decimals.
 *
 * @example
 * formatFixed(3.14159, 2); // "3.14"
 */
export const formatFixed = (n, digits = 2, locale = 'en-IN') =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(n);

/**
 * Format a number using the Indian number system (lakh/crore formatting).
 *
 * @param {number} n - The number to format.
 * @returns {string} Indian-style formatted number.
 *
 * @example
 * formatIndian(1234567); // "12,34,567"
 */
export const formatIndian = (n) => new Intl.NumberFormat('en-IN').format(n);
