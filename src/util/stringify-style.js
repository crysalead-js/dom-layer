/**
 * Returns a `'key1:value1;key2:value2" ...'` string from
 * a `{ key1: "value1", key2: "value2" }` object.
 *
 * @param  Object attrs The keys/values object to stringify.
 * @return String       The corresponding string.
 */
function stringifyStyle(style) {
  if (typeof style === "string") {
    return style;
  }
  var values = [];
  for (var key in style) {
    values.push(key + ':' + style[key]);
  }
  return values.join(";");
}

module.exports = stringifyStyle;
