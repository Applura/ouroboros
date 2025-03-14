import { describe, test, expect } from "@jest/globals";
import { consume, parse } from "./main.js";
import { UsageError } from "./errors.js";

describe("main module", () => {
  describe("parse", () => {
    describe("should raise a usage error for invalid JSON", () => {
      describe.each([
        ["", "Unexpected end of JSON input"],
        ["[", "Unexpected end of JSON input"],
        ["{", "Expected property name or '}' in JSON at position 1"],
        ['{"foo"}', "Expected ':' after property name in JSON at position 6"],
      ])("%p", (input, reason) => {
        test("throws", () => {
          expect(() => {
            try {
              parse(input, reason);
            } catch (e) {
              expect(
                e.message.toString().startsWith(`invalid JSON: ${reason}`),
              ).toBe(true);
              throw e;
            }
          }).toThrow(UsageError);
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

describe("readme example", () => {
  test("should work as promised", () => {
    const exampleJSON = `{
      "data": {
        "type": "articles",
        "id": "1",
        "attributes": {
          "title": "JSON:API paints my bikeshed!"
        },
        "links": {
          "self": "http://example.com/articles/1"
        },
        "relationships": {
          "author": {
            "links": {
              "self": "http://example.com/articles/1/relationships/author",
              "related": "http://example.com/articles/1/author"
            },
            "data": { "type": "people", "id": "9" }
          },
          "comments": {
            "links": {
              "self": "http://example.com/articles/1/relationships/comments",
              "related": "http://example.com/articles/1/comments"
            },
            "data": [{ "type": "comments", "id": "5" }]
          }
        }
      },
      "included": [
        {
          "type": "people",
          "id": "9",
          "attributes": {
            "firstName": "Dan",
            "lastName": "Gebhardt",
            "twitter": "dgeb"
          },
          "links": {
            "self": "http://example.com/people/9"
          },
          "relationships": {
            "comments": {
              "links": {
                "self": "http://example.com/people/9/relationships/comments",
                "related": "http://example.com/people/9/comments"
              },
              "data": [{ "type": "comments", "id": "5" }]
            }
          }
        },
        {
          "type": "comments",
          "id": "5",
          "attributes": {
            "body": "First!"
          },
          "relationships": {
            "author": {
              "data": { "type": "people", "id": "9" }
            }
          },
          "links": {
            "self": "http://example.com/comments/5"
          }
        }
      ]
    }`;

    const article = parse(exampleJSON);
    const author = article.author;
    const comments = article.comments;

    expect(`"${article.title}" by ${author.firstName} ${author.lastName}`).toBe(
      '"JSON:API paints my bikeshed!" by Dan Gebhardt',
    );

    for (const comment of comments) {
      const { body, author: commenter } = comment;
      expect(`-- ${commenter.firstName} commented: "${body}"`).toBe(
        '-- Dan commented: "First!"',
      );
      expect(author === commenter).toBe(true);
    }

    // If you have raw JSON, use parse.
    const parsedArticle = parse(exampleJSON);

    // If you have a parsed object, use consume.
    const doc = JSON.parse(exampleJSON);
    const consumedArticle = consume(doc);

    expect(parsedArticle.title === consumedArticle.title).toBe(true);
  });
});
