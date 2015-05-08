var patch = require("./patch/patch");

var isArray = Array.isArray;

function update(container, fromNodes, toNodes, parent, inSvg) {
  if (typeof toNodes === "function") {
    toNodes = toNodes(container, parent);
  }
  if (toNodes == null) {
    return;
  }
  if (!isArray(toNodes)) {
    toNodes = [toNodes];
  }
  return patch(container, fromNodes, toNodes, parent, inSvg);
}

module.exports = update;
