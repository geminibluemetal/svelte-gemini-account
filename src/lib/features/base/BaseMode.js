/**
 * Apply MongoDB-like projection to an object
 * @param {Object} data - source object
 * @param {Object} projection - projection object e.g., { fullNumber: 1, shortNumber: 0 }
 * @returns {Object} - projected object
 */
export function applyProjection(data = {}, projection = {}) {
  if (!projection || Object.keys(projection).length === 0) return { ...data };

  const result = { id: data.id };
  const includeMode = Object.values(projection).some((v) => v === 1);

  if (includeMode) {
    // Include only fields with 1
    for (const key in projection) {
      if (projection[key] && key in data) {
        result[key] = data[key];
      }
    }
  } else {
    // Exclude fields with 0
    for (const key in data) {
      if (!(key in projection && projection[key] === 0)) {
        result[key] = data[key];
      }
    }
  }

  return result;
}
