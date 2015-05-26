var stringifyStyle = require("./stringify-style");
/**
 * Returns a `'key1="value1" key2="value2" ...'` string from
 * a `{ key1: "value1", key2: "value2" }` object.
 *
 * @param  Object attrs The keys/values object to stringify.
 * @return String       The corresponding string.
 */
function stringifyAttrs(attrs) {
  if (!attrs) {
    return "";
  }
  var attributes = [], value;
  for (var key in attrs) {
    value = attrs[key];
    if (key === "style") {
      value = stringifyStyle(value);
    }
    if (typeof value !== "string") {
      continue;
    }
    attributes.push(key + '="' + value.replace(/"/g, '\\"') + '"');
  }
  return attributes.join(" ");
}

module.exports = stringifyAttrs;