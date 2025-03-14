import { describe, expect, test } from "@jest/globals";
import { isConventionalObject } from "./utilities.js";

describe("isConventionalObject", () => {
  describe.each([
    [null, false],
    [false, false],
    [true, false],
    [0, false],
    [1, false],
    [0.0, false],
    [0.1, false],
    ["", false],
    ["string", false],
    [[], false],
    [{}, true],
  ])("%p should be %p", (input, expectation) => {
    test(`should be ${expectation}`, () => {
      expect(isConventionalObject(input)).toBe(expectation);
    });
  });
});
