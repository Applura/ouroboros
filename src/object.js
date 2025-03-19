import { UsageError } from "./errors.js";

const reservedNames = ["type", "id", "relationships", "meta", "links", "top"];
/**
 * Container for a JSON:API document which makes it easy to read JSON:API resource object attributes.
 *
 * @param {data: {type: string, id: string}} obj
 *
 * @class
 * @property {Resource} primary
 */
export default function Ouroboros(obj) {
  if ("links" in obj) {
    Object.defineProperty(this, "links", {
      value: obj.links,
      enumerable: true,
    });
  }
  if ("meta" in obj) {
    Object.defineProperty(this, "meta", {
      value: obj.meta,
      enumerable: true,
    });
  }
  if ("data" in obj) {
    Object.defineProperty(this, "resources", { value: new Map() });
    Object.defineProperty(this, "primary", {
      value: new Resource(obj.data, this),
    });
  }
  if ("included" in obj) {
    for (const include of obj.included) {
      this.resources.set(
        `${include.type}:${include.id}`,
        new Resource(include, this),
      );
    }
  }
}

/**
 * Container for a JSON:API resource object which makes it easy to read attributes and related resources.
 *
 * @param {type: string, id: string, ?attributes: object, ?links: object, ?meta: object, ?relationships: object} obj
 *   A single JSON:API resource object.
 * @param {Ouroboros} doc
 *   The parent container for the resource object.
 *
 * @class
 * @property {string} type
 * @property {string} id
 * @property {?object} links
 * @property {?object} meta
 * @property {?object} relationships
 */
function Resource(obj, doc) {
  Object.defineProperty(this, "type", {
    value: obj.type,
    enumerable: true,
  });
  Object.defineProperty(this, "id", {
    value: obj.id,
    enumerable: true,
  });
  if ("attributes" in obj) {
    for (const attribute in obj.attributes) {
      if (reservedNames.includes(attribute)) {
        throw new UsageError(
          `resource objects must not have an attribute member named: ${attribute}`,
        );
      }
      Object.defineProperty(this, attribute, {
        value: obj.attributes[attribute],
        enumerable: true,
      });
    }
  }
  if ("relationships" in obj) {
    const relationships = {};
    for (const relationship in obj.relationships) {
      if (
        ["type", "id", "relationships", "meta", "links"].includes(relationship)
      ) {
        throw new UsageError(
          `resource objects must not have a relationship member named: ${relationship}`,
        );
      }
      const getRelated = Array.isArray(obj.relationships[relationship].data)
        ? () => obj.relationships[relationship].data.map(resolveFrom(doc))
        : () => resolveFrom(doc)(obj.relationships[relationship].data);
      Object.defineProperty(this, relationship, {
        get: getRelated,
        enumerable: true,
      });
      const { meta, links } = obj.relationships[relationship];
      Object.defineProperty(relationships, relationship, {
        value: { meta, links },
        enumerable: true,
      });
    }
    Object.defineProperty(this, "relationships", {
      value: relationships,
      enumerable: false,
    });
  }
  if ("links" in obj) {
    Object.defineProperty(this, "links", {
      value: obj.links,
      enumerable: true,
    });
  }
  if ("meta" in obj) {
    Object.defineProperty(this, "meta", {
      value: obj.meta,
      enumerable: true,
    });
  }
  if ("links" in doc || "meta" in doc) {
    const top = {};
    if ("links" in doc) {
      Object.defineProperty(top, "links", {
        get: () => doc.links,
        enumerable: true,
      });
    }
    if ("meta" in doc) {
      Object.defineProperty(top, "meta", {
        get: () => doc.meta,
        enumerable: true,
      });
    }
    Object.defineProperty(this, "top", {
      value: top,
      enumerable: true,
    });
  }
  doc.resources.set(`${obj.type}:${obj.id}`, this);
}

function resolveFrom(doc) {
  return (identifier) => {
    return doc.resources.get(`${identifier.type}:${identifier.id}`);
  };
}
