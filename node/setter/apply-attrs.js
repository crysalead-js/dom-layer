var domElement = require("dom-element");
var applyStyle = require("./apply-style");

function applyAttrs(node, element, previous, attrs) {
  if (!previous && !attrs) {
    return attrs;
  }
  var name, value;
  previous = previous || {};
  attrs = attrs || {};

  for (name in previous) {
    if (previous[name] && !attrs[name]) {
      element.removeAttribute(name);
    }
  }
  for (name in attrs) {
    value = attrs[name];
    if (previous[name] === value) {
      continue;
    }
    if (name === "style") {
      applyStyle(element, previous[name], value);
    } else if (name === "value") {
      domElement.value(element, value);
    } else {
      element.setAttribute(name, value);
    }
  }
  return attrs;
}

module.exports = applyAttrs;
