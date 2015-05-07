var applyAttrs = require("./apply-attrs");

function applyProps(node, element, previous, props) {
  var name, value;
  previous = previous || {};
  props = props || {};

  for (var name in props) {
    var value = props[name];
    if (name === "attributes") {
      applyAttrs(node, element, previous[name], value);
      continue;
    }
    if (previous[name] === value) {
      continue;
    }
    element[name] = value;
  }
}

module.exports = applyProps;
