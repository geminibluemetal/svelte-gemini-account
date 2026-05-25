import { getFormattedDate } from "$lib/utils/dateTime";

/**
 * Generates the 14-day cycle list shifted by a specific number of cycles.
 * @param {Date} checkingDate - The date to check against.
 * @param {Object} options - Configuration options.
 * @param {number} options.cycleOffset - Number of cycles to shift (0 = current, 1 = next, -1 = previous, etc.).
 * @param {boolean} options.ignoreFuture - If true, skips dates that are ahead of the current real-world time.
 * @returns {Object} Object containing the filtered list, shortName, and longName.
 */
export function get14dayCycle({ checkingDate = new Date(), cycleOffset = 0, ignoreFuture = false } = {}) {
  cycleOffset = Number(cycleOffset)
  const oneDayMilliseconds = 1000 * 60 * 60 * 24;
  const anchorDate = new Date(2026, 3, 27); // April 27, 2026

  // Clone to prevent mutating the original passed-in date object
  const workingDate = new Date(checkingDate);

  anchorDate.setHours(0, 0, 0, 0);
  workingDate.setHours(0, 0, 0, 0);

  const diffInDays = Math.floor((workingDate - anchorDate) / oneDayMilliseconds);

  // Safe modulo trick for positive/negative numbers (returns 0 to 13)
  const cycleDay = ((diffInDays % 14) + 14) % 14;

  // 1. Calculate the start of the CURRENT cycle
  let startOfTheCycleTime = workingDate.getTime() - (cycleDay * oneDayMilliseconds);

  // 2. Adjust the starting Monday dynamically by multiplying the offset
  startOfTheCycleTime += cycleOffset * 14 * oneDayMilliseconds;

  // --- FIX START ---
  // Calculate the true start and end dates of the 14-day block independently of the loop
  const startDate = new Date(startOfTheCycleTime);
  const endDate = new Date(startOfTheCycleTime + 13 * oneDayMilliseconds); // 13 days after start = 14th day
  // --- FIX END ---

  // 3. Build the 14-day list
  const list = [];
  const realNow = new Date(); // Fetch once instead of creating inside the loop

  for (let i = 0; i < 14; i++) {
    const date = new Date(startOfTheCycleTime + i * oneDayMilliseconds);

    // Skip adding to list only if ignoreFuture is true AND the date is ahead of now
    if (ignoreFuture && date > realNow) {
      continue;
    }
    list.push(date);
  }

  // Generate formatting names using the fixed cycle boundaries
  const longName = `${getFormattedDate(startDate)} - ${getFormattedDate(endDate)}`; // DD-MM-YYYY to DD-MM-YYYY

  // Note: Fixed a minor bug in your original regex replacement here as well
  let shortName = longName.replace(/-\d{4}/g, ""); // DD-MM to DD-MM

  return { list, shortName, longName, cycleOffset };
}