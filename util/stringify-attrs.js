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