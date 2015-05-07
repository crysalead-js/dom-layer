var Tag = require("../../node/tag");
var Text = require("../../node/text");

function h(context, children) {
  var context = context || {};
  var children = children || [];

  if (typeof context === "string") {
    return new Text(context);
  }
  var tagName = (context.tagName || "div").toLowerCase();
  delete context.tagName;

  return new Tag(tagName, context, children.map(function(value, key) {
    if (typeof value === "string") {
      return new Text(value);
    }
    return value;
  }));
}

module.exports = h;