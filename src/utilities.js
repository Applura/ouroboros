/**
 * Determines if the given value is a simple object.
 *
 * For example, what a JSON object would be parsed into.
 *
 * @param {any} test
 * @returns {boolean}
 */
export function isConventionalObject(test) {
  return !!(
    typeof test === "object" &&
    test !== null &&
    !Array.isArray(test) &&
    test
  );
}
