/**
 * Generates the 14-day cycle list for the current, next, or previous cycle.
 * @param {Date} checkingDate - The date to check against.
 * @param {'current'|'next'|'previous'} cycleType - Which cycle list to return.
 * @returns {Date[]} Array of 14 Date objects.
 */
export function get14dayCycle(checkingDate = new Date(), cycleType = 'current') {
  const oneDayMilliseconds = 1000 * 60 * 60 * 24;
  const ancherDate = new Date(2026, 3, 27); // April 27, 2026

  // Clone to prevent mutating the original passed-in date object
  const workingDate = new Date(checkingDate);

  ancherDate.setHours(0, 0, 0, 0);
  workingDate.setHours(0, 0, 0, 0);

  const diffInDays = Math.floor((workingDate - ancherDate) / oneDayMilliseconds);

  // Safe modulo trick for positive/negative numbers (returns 0 to 13)
  const cycleDay = ((diffInDays % 14) + 14) % 14;

  // 1. Calculate the start of the CURRENT cycle
  let startOfTheCycleTime = workingDate.getTime() - (cycleDay * oneDayMilliseconds);

  // 2. Adjust the starting Monday if the user asked for next or previous chunks
  if (cycleType === 'next') {
    startOfTheCycleTime += 14 * oneDayMilliseconds; // Shift forward 14 days
  } else if (cycleType === 'previous') {
    startOfTheCycleTime -= 14 * oneDayMilliseconds; // Shift backward 14 days
  }

  // 3. Build the 14-day list
  const list = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(startOfTheCycleTime + i * oneDayMilliseconds);
    list.push(date);
  }

  return list;
}