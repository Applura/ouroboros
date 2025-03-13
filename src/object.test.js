import { describe, test, expect } from "@jest/globals";
import { consume } from "./main.js";

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
    const {
      foo: {
        data: { type, id, bar },
      },
    } = consume({
      data: {
        relationships: {
          foo: {
            data: {
              type: "foo:type",
              id: "3bd6083aff810e",
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
    expect(type).toBe("foo:type");
    expect(id).toBe("3bd6083aff810e");
    expect(bar).toBe("baz");
  });

  test("to-many relationship destructuring", () => {
    const {
      foo: { data: bar },
    } = consume({
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
    expect(2).toBe(bar.length);
    const [one, two] = bar;
    expect(one.type).toBe("foo:type");
    expect(one.id).toBe("3bd6083aff810e");
    expect(one.bar).toBe("baz");
    expect(two.type).toBe("foo:type");
    expect(two.id).toBe("1852628f03668a");
    expect(two.bar).toBe("qux");
  });
});
