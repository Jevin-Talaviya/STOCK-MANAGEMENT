/**
 * Escapes regex special characters to prevent regex injection attacks.
 * @param {string} string
 * @returns {string}
 */
export function escapeRegex(string) {
  if (!string) return "";
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Builds a MongoDB $or query object for global search based on a query string.
 * Fields to search: machineName, sapCode, materialDescription, storeLocation.
 * @param {string} q
 * @returns {object} MongoDB query object
 */
export function buildSearchQuery(q) {
  if (!q || typeof q !== "string" || q.trim() === "") {
    return {};
  }

  const escapedQuery = escapeRegex(q.trim());
  const regex = { $regex: escapedQuery, $options: "i" };

  return {
    $or: [
      { machineName: regex },
      { sapCode: regex },
      { materialDescription: regex },

      { storeLocation: regex },
    ],
  };
}
