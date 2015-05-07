var domElement = require("dom-element");
var applyStyle = require("./apply-style");

function applyAttrs(node, element, previous, attrs, inSvg) {
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
    } else if (inSvg && name === "href") { // HACK
      element.setAttributeNS("http://www.w3.org/1999/xlink", "href", value);
    } else {
      element.setAttribute(name, value);
    }
  }
  return attrs;
}

module.exports = applyAttrs;
