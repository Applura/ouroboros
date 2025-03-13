import { describe, test, expect } from "@jest/globals";
import { consume, parse } from "./main.js";
import { UsageError } from "./errors.js";

describe("main module", () => {
  describe("parse", () => {
    describe("should raise a usage error for invalid JSON", () => {
      describe.each([
        ["", "Unexpected end of JSON input"],
        ["[", "Unexpected end of JSON input"],
        [
          "{",
          "Expected property name or '}' in JSON at position 1 (line 1 column 2)",
        ],
        [
          '{"foo"}',
          "Expected ':' after property name in JSON at position 6 (line 1 column 7)",
        ],
      ])("%p", (input, reason) => {
        test("throws", () => {
          expect(() => parse(input, reason)).toThrow(
            new UsageError(`invalid JSON: ${reason}`),
          );
        });
      });
    });
  });

  describe("consume", () => {
    describe("should raise a usage error for values that are not a compliant JSON:API data document", () => {
      describe.each([null, false, true, 0, 1, 2, [], [true], () => {}, {}])(
        "%p",
        (input) => {
          test("throws", () => {
            expect(() => consume(input)).toThrow(
              new UsageError(
                "JSON:API documents without primary data are not supported",
              ),
            );
          });
        },
      );
    });
  });
});
