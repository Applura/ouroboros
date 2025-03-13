/**
 * Base error type for all errors raised by this library.
 */
export class LibraryError extends Error {
  constructor(message) {
    super(message);
    this.name = "LibraryError";
  }
}

/**
 * Raised when the implementation of this library has caused an error.
 *
 * For example, when a known edge case has not been handled.
 */
export class ImplementationError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "ImplementationError";
  }
}

/**
 * Raised when the library detects an error in the way this library is being used.
 */
export class UsageError extends LibraryError {
  constructor(message) {
    super(message);
    this.name = "UsageError";
  }
}
