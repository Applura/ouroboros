import {UsageError} from "./errors.js";
import Doc from "./document.js";

export function parse(json) {
    return wrap(JSON.parse(json));
}

export function wrap(doc) {
    if (!("data" in doc)) {
        throw new UsageError(
            "the parse function only supports JSON:API documents with primary data",
        );
    }
    return (new Doc(doc)).primary;
}
