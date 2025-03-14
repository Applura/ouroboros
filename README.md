# Ouroboros

Ouroboros decouples your business logic from the intricacies of
the [JSON:API specification's][spec] [document structure][structure] by
transforming a complex JSON:API document object into a simplified object with
easy-to-access properties.

### TODO

- [x] Refactor Deno tests into a node.js compatible test framework.
- [x] Add a `package.json` file
- [ ] Publish a bundled ES module
- [x] Elide the `data` relationship object member
- [ ] Author a simple [JSON:API profile][profiles] restricting the use of
  `type`, `id`, `relationships`, `links`, `meta`, or `base` as an attribute or
  relationship field name.
- [x] Add GitHub workflows
- [ ] Handle documents with a primary data array
- [x] Refactor the way links are treated to be less unwieldy

[profiles]: https://jsonapi.org/extensions/#existing-profiles

### API

Ouroboros exports two mutually-exclusive functions: `parse` and `consume`. Use
`parse` if you have a raw JSON:API string. Use `consume` if your JSON object has
already been parsed with `JSON.parse()`.

```js
import { parse, consume } from "@applura/ouroboros";

// If you have raw JSON, use parse.
const json = "{/* example shown below */}";
const parsedArticle = parse(json);

// If you have a parsed object, use consume.
const doc = JSON.parse(json);
const consumedArticle = consume(doc);

console.log(parsedArticle.title === consumedArticle.title); // true.
```

### Example

For example, notice that the code below doesn't need to repetitively access the
`data.attributes` property or know the difference between an `attributes` or
`relationships` [field][fields]—nor does is it need to search for the `people`
object in the [`included` member][included]—Ouroboros does it transparently.

```js
const article = parse(/* shown below */);
const author = article.author;
const comments = article.comments;

console.log(`"${article.title}" by ${author.firstName} ${author.lastName}`);

for (const comment of comments) {
  const {body, author: commenter} = comment;
  console.log(`-- ${commenter.firstName} commented: "${body}"`);
}

// Prints…
// "JSON:API paints my bikeshed!" by Dan Gebhardt
// -- Dan commented: "First!"
```

```json
{
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
  "links": {
    "describedby": "http://example.com/schemas/articles"
  },
  "meta": {
    "description": "Document containing a single article and its related resources."
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
}
```

#### Why _Ouroboros_?

Consuming a JSON:API document with a circular relationship causes Ouroboros to
loop back on itself without breaking.

For example, using the example above, the following code works as one would
expect:

```js
const { author } = parse(/* example shown above */);

console.log(
  author
  .comments[0]
  .author
  .comments[0]
  // ∞
  .author
  .comments[0]
  .body
);

// Prints…
// First!
```

#### What about links and metadata?

All `links` and `meta` members in the document are preserved.

To access `links` or `meta` object members from the
original [top-level object][top-level], use the `base` property.

To access `links` or `meta` object members from one of the original
[relationship objects][relationships], use the `relationships` property on the
parent resource object.

```js
const article = parse(/* example shown above */)
const { author } = article;

// To access a top-level links or meta member, use the base property on any
// resource:
console.log(article.base.links.describedby); // "http://example.com/schemas/articles"
console.log(article.base.meta.description); // "Document containing a single article and its related resources."
console.log(author.base.links.describedby); // "http://example.com/schemas/articles"
console.log(author.base.meta.description); // "Document containing a single article and its related resources."

// To access a links or meta member on a relationship, use the relationships
// property on the context resource object *not* the related resource object:
console.log(article.relationships.author.links.related); // "http://example.com/articles/1/author"
```

#### Limitations

Resource objects must not have any attributes or relationships with any of the
following names:

- `type`
- `id`
- `relationships`
- `meta`
- `links`
- `base`

[fields]: https://jsonapi.org/format/#document-resource-object-fields
[included]: https://jsonapi.org/format/#document-compound-documents
[relationships]: https://jsonapi.org/format/#document-resource-object-relationships
[spec]: https://jsonapi.org/format/
[structure]: https://jsonapi.org/format/#document-structure
[top-level]: https://jsonapi.org/format/#document-top-level
