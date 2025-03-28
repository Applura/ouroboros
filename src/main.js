import { UsageError } from "./errors.js";
import Ouroboros from "./object.js";
import { isConventionalObject } from "./utilities.js";

/**
 * {@link parse} is a convenience method that wraps {@link consume}, but can be called with an unparsed JSON string.
 *
 * @param {string} json
 *   The unparsed JSON:API document body parse and consume.
 *
 * @returns {Resource}
 */
export function parse(json) {
  let doc;
  try {
    doc = JSON.parse(json);
  } catch (e) {
    throw new UsageError(`invalid JSON: ${e.message}`);
  }
  return consume(doc);
}

/**
 * {@link consume} instantiates a new Ouroboros object and returns doc's primary resource.
 *
 * @param {data: object} doc
 *
 * @returns {Resource}
 */
export function consume(doc) {
  // First excludes all cases where doc is not an object with properties and then ensure doc has a "data" member.
  if (!isConventionalObject(doc) || !("data" in doc)) {
    throw new UsageError(
      "JSON:API documents without primary data are not supported",
    );
  }
  return new Ouroboros(doc).primary;
}
