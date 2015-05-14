function applyProps(element, previous, props) {
  var name;
  previous = previous || {};
  props = props || {};

  for (name in previous) {
    if (props[name] === undefined) {
      element[name] = undefined;
    }
  }

  for (name in props) {
    if (previous[name] === props[name]) {
      continue;
    }
    element[name] = props[name];
  }
}

module.exports = applyProps;
