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
  var attributes = [];
  for (var key in attrs) {
    if (typeof attrs[key] !== "string") {
      continue;
    }
    attributes.push(key + '="' + attrs[key].replace(/"/g, '\\"') + '"');
  }
  return attributes.join(" ");
}

module.exports = stringifyAttrs;