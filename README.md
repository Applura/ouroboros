# Ouroboros

Ouroboros decouples your presentation logic from the intricacies of the JSON:API document structure by transforming a complex JSON:API document object into a simplified object with easy-to-access properties.

For example, notice that the code below doesn't need to repetitively access the `data.attributes` property or know the difference between `attributes` and `relationships` fields—nor does is it need to search for the `people` object in the `included` array—Ouroboros does it transparently.

```js
const doc = JSON.parse({/* shown below */});

const article = parse(doc);
const author = article.author.data;
const comments = article.comments.data;

console.log(`"${article.title}" by ${author.firstName} ${author.lastName}`);

for (const {
  body,
  author: commenter,
} of comments) {
  console.log(`-- ${commenter.firstName} commented: "${body}"`);
}

// Prints…
// "JSON:API paints my bikeshed!" by Dan Gebhardt
// -- Dan commented: "First!"

console.log(author === commenter); // true
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
        "data": [
          { "type": "comments", "id": "5" }
        ]
      }
    }
  },
  "included": [{
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
          { "type": "comments", "id": "5" }
        ]
      }
    }
  }, {
    "type": "comments",
    "id": "5",
    "attributes": {
      "body": "First!"
    },
    "relationships": {
      "author": {
        "data": { "type": "people", "id": "2" }
      }
    },
    "links": {
      "self": "http://example.com/comments/5"
    }
  }]
}
```

#### Why _Ouroboros_?

Consuming a JSON:API document with a circular relationship causes Ouroboros to loop back on itself (without breaking).

For example, using the example above, the following code works without a problem:

```js
const doc = JSON.parse({/* shown above */});

const { author } = parse(doc);

console.log(
  author.data
  .comments.data[0]
  .author.data
  .comments.data[0]
  // ∞
  .author.data
  .comments.data[0]
  .body
);

// Prints…
// First!
```

### TODO

- [ ] Refactor Deno tests into a node.js compatible test framework.
- [ ] Add a `package.json` file
- [ ] Publish a bundled ES module
- [ ] Elide the `data` relationship object member
- [ ] Author a simple [JSON:API profile][profiles] restricting the use of `data`, `relationship` (singular), `links`, or `meta` as an attribute or relationship field name.
- [ ] Add GitHub workflows
- [ ] Handle documents with a primary data array
- [ ] Refactor the way links are treated to be less unwieldy

[profiles]: https://jsonapi.org/extensions/#existing-profiles
