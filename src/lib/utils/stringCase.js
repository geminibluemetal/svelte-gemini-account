/**
 * Advanced stringCase utility (safe version)
 * Only converts when input is a string.
 * Non-strings are returned unchanged.
 */
export default {
  // UPPERCASE
  upper: (str) => (typeof str === 'string' ? str.toUpperCase() : str),

  // lowercase
  lower: (str) => (typeof str === 'string' ? str.toLowerCase() : str),

  // Simple Title Case (Every Word Capitalized)
  title: (str) =>
    typeof str === 'string'
      ? str
        .toLowerCase()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      : str,

  // Paragraph style (capitalize first letter only)
  para: (str) =>
    typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str,

  // Smart Title Case
  smartTitle: (str) => {
    if (typeof str !== 'string') return str;
    if (!str) return '';

    const words = str
      .replace(/[_-]+/g, ' ') // Convert underscores/hyphens to spaces
      .replace(/[^\w\s]/g, '') // Remove ALL special characters (except letters, numbers, spaces)
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .split(/\s+/); // Split by spaces

    return words
      .map((word, i) => {
        if (!word) return '';
        if (/^[A-Z0-9]+$/.test(word)) return word; // acronyms
        if (i === 0 || i === words.length - 1) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }
};
