import { describe, test, expect } from "@jest/globals";
import { consume, parse } from "./main.js";

describe("Ouroboros object", () => {
  test("attribute destructuring", () => {
    const { foo } = consume({
      data: {
        attributes: {
          foo: "bar",
        },
      },
    });
    expect(foo).toBe("bar");
  });

  test("to-one relationship destructuring", () => {
    const doc = consume({
      data: {
        relationships: {
          foo: {
            data: {
              type: "foo:type",
              id: "3bd6083aff810e",
            },
            meta: {
              description: "This is a to-one relationship object",
            },
          },
        },
      },
      included: [
        {
          type: "foo:type",
          id: "3bd6083aff810e",
          attributes: {
            bar: "baz",
          },
        },
      ],
    });
    const {
      foo: { type, id, bar },
    } = doc;
    expect(type).toBe("foo:type");
    expect(id).toBe("3bd6083aff810e");
    expect(bar).toBe("baz");
    expect(doc.relationships.foo.meta.description).toBe(
      "This is a to-one relationship object",
    );
  });

  test("to-many relationship destructuring", () => {
    const { foo, relationships } = consume({
      data: {
        relationships: {
          foo: {
            data: [
              {
                type: "foo:type",
                id: "3bd6083aff810e",
              },
              {
                type: "foo:type",
                id: "1852628f03668a",
              },
            ],
            meta: {
              description: "This is a to-many relationship object",
            },
          },
        },
      },
      included: [
        {
          type: "foo:type",
          id: "1852628f03668a",
          attributes: {
            bar: "qux",
          },
        },
        {
          type: "foo:type",
          id: "3bd6083aff810e",
          attributes: {
            bar: "baz",
          },
        },
      ],
    });
    expect(2).toBe(foo.length);
    const [one, two] = foo;
    expect(one.type).toBe("foo:type");
    expect(one.id).toBe("3bd6083aff810e");
    expect(one.bar).toBe("baz");
    expect(two.type).toBe("foo:type");
    expect(two.id).toBe("1852628f03668a");
    expect(two.bar).toBe("qux");
    expect(relationships.foo.meta.description).toBe(
      "This is a to-many relationship object",
    );
  });

  test("circular access", () => {
    const doc = `{
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
            "data": {
              "type": "people",
              "id": "9"
            }
          },
          "comments": {
            "links": {
              "self": "http://example.com/articles/1/relationships/comments",
              "related": "http://example.com/articles/1/comments"
            },
            "data": [
              {
                "type": "comments",
                "id": "5"
              }
            ]
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
              "data": [
                {
                  "type": "comments",
                  "id": "5"
                }
              ]
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
              "data": {
                "type": "people",
                "id": "9"
              }
            }
          },
          "links": {
            "self": "http://example.com/comments/5"
          }
        }
      ]
    }`;
    const article = parse(doc);
    expect(article.type).toBe("articles");
    expect(article.id).toBe("1");
    expect(article.title).toBe("JSON:API paints my bikeshed!");
    const { author } = article;
    expect(author.firstName).toBe("Dan");
    expect(author.comments.length).toBe(1);
    expect(author.comments[0].body).toBe("First!");
    expect(author.comments[0].author.firstName).toBe("Dan");
    expect(author.comments[0].author.comments.length).toBe(1);
    expect(author.comments[0].author.comments[0].body).toBe("First!");
    expect(author.comments[0].author.comments[0].author.firstName).toBe("Dan");
    expect(author.comments[0].author.comments[0].author.comments.length).toBe(
      1,
    );
    expect(author.comments[0].author.comments[0].author.comments[0].body).toBe(
      "First!",
    );
    expect(
      author.comments[0].author.comments[0].author.comments[0].author.firstName,
    ).toBe("Dan");
    expect(
      author.comments[0].author.comments[0].author.comments[0].author.comments
        .length,
    ).toBe(1);
    expect(
      author.comments[0].author.comments[0].author.comments[0].author
        .comments[0].body,
    ).toBe("First!");
  });

  test("links and metadata", () => {
    const item = consume({
      data: {
        type: "item",
        id: "1",
        attributes: {
          title: "Title field",
        },
        relationships: {
          author: {
            data: {
              type: "person",
              id: "1",
            },
            links: {
              related: "/items/1/author",
            },
            meta: {
              description: "This relates the item to its author.",
            },
          },
        },
        links: {
          self: {
            href: "/items/1",
          },
        },
        meta: {
          description: "This is a resource object representing an item.",
        },
      },
      included: [
        {
          type: "person",
          id: "1",
          attributes: {
            name: "Jean Dot",
          },
          links: {
            self: {
              href: "/people/1",
            },
          },
          meta: {
            description: "This is a resource object representing a person.",
          },
        },
      ],
      links: {
        self: {
          href: "https://example.com/items/1",
        },
      },
      meta: {
        description: "This is a top-level document object.",
      },
    });
    expect(item.links.self.href).toBe("/items/1");
    expect(item.meta.description).toBe(
      "This is a resource object representing an item.",
    );
    expect(item.top.links.self.href).toBe("https://example.com/items/1");
    expect(item.top.meta.description).toBe(
      "This is a top-level document object.",
    );
    expect(item.author.links.self.href).toBe("/people/1");
    expect(item.author.meta.description).toBe(
      "This is a resource object representing a person.",
    );
    expect(item.author.top.links.self.href).toBe("https://example.com/items/1");
    expect(item.author.top.meta.description).toBe(
      "This is a top-level document object.",
    );
    expect(item.relationships.author.links.related).toBe("/items/1/author");
    expect(item.relationships.author.meta.description).toBe(
      "This relates the item to its author.",
    );
  });
});
