var applyDataset = require("./apply-dataset");

function applyProps(element, previous, props) {
  if (!previous && !props) {
    return props;
  }
  var name;
  previous = previous || {};
  props = props || {};

  for (name in previous) {
    if (name !== "dataset" && props[name] === undefined) {
      element[name] = undefined;
    }
  }

  for (name in props) {
    if (name === "dataset" || previous[name] === props[name]) {
      continue;
    }
    element[name] = props[name];
  }

  applyDataset(element, previous["dataset"], props["dataset"]);

  return props;
}

module.exports = applyProps;
