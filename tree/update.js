var patch = require("./patch");

var isArray = Array.isArray;

function update(container, fromNodes, toNodes, parent) {
  if (typeof toNodes === "function") {
    toNodes = toNodes(container, parent);
  }
  if (toNodes == null) {
    return;
  }
  if (!isArray(toNodes)) {
    toNodes = [toNodes];
  }
  return patch(container, fromNodes, toNodes, parent);
}

module.exports = update;
