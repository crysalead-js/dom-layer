var patch = require("./patch/patch");

var isArray = Array.isArray;

function update(container, fromNodes, toNodes) {
  if (typeof toNodes === "function") {
    toNodes = toNodes();
  }
  if (toNodes == null) {
    return;
  }
  if (!isArray(toNodes)) {
    toNodes = [toNodes];
  }
  return patch(container, fromNodes, toNodes);
}

module.exports = update;
