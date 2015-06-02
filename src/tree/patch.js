var isEmpty = require("is-empty");

var isArray = Array.isArray;

/**
 * Patches & Reorders child nodes of a container (i.e represented by `fromChildren`) to match `toChildren`.
 *
 * Since finding the longest common subsequence problem is NP-hard, this implementation
 * is a simple heuristic for reordering nodes with a "minimum" of moves in O(n).
 *
 * @param Object container    The parent container.
 * @param Array  children     The current array of children.
 * @param Array  toChildren   The new array of children to reach.
 * @param Object parent       The parent virtual node.
 */
function patch(container, children, toChildren, parent) {
  var fromChildren = children.slice();
  var fromStartIndex = 0, toStartIndex = 0;
  var fromEndIndex = fromChildren.length - 1;
  var fromStartNode = fromChildren[0];
  var fromEndNode = fromChildren[fromEndIndex];
  var toEndIndex = toChildren.length - 1;
  var toStartNode = toChildren[0];
  var toEndNode = toChildren[toEndIndex];

  var indexes, index, node, before;

  while (fromStartIndex <= fromEndIndex && toStartIndex <= toEndIndex) {
    if (fromStartNode === undefined) {
      fromStartNode = fromChildren[++fromStartIndex];
    } else if (fromEndNode === undefined) {
      fromEndNode = fromChildren[--fromEndIndex];
    } else if (fromStartNode.match(toStartNode)) {
      fromStartNode.patch(toStartNode);
      fromStartNode = fromChildren[++fromStartIndex];
      toStartNode = toChildren[++toStartIndex];
    } else if (fromEndNode.match(toEndNode)) {
      fromEndNode.patch(toEndNode);
      fromEndNode = fromChildren[--fromEndIndex];
      toEndNode = toChildren[--toEndIndex];
    } else if (fromStartNode.match(toEndNode)) {
      fromStartNode.patch(toEndNode);
      container.insertBefore(fromStartNode.element, fromEndNode.element.nextSibling);
      fromStartNode = fromChildren[++fromStartIndex];
      toEndNode = toChildren[--toEndIndex];
    } else if (fromEndNode.match(toStartNode)) {
      fromEndNode.patch(toStartNode);
      container.insertBefore(fromEndNode.element, fromStartNode.element);
      fromEndNode = fromChildren[--fromEndIndex];
      toStartNode = toChildren[++toStartIndex];
    } else {
      if (indexes === undefined) {
        indexes = keysIndexes(fromChildren, fromStartIndex, fromEndIndex);
      }
      index = indexes[toStartNode.key];
      if (index === undefined) {
        container.insertBefore(toStartNode.render(parent), fromStartNode.element);
        toStartNode = toChildren[++toStartIndex];
      } else {
        node = fromChildren[index];
        node.patch(toStartNode);
        fromChildren[index] = undefined;
        container.insertBefore(node.element, fromStartNode.element);
        toStartNode = toChildren[++toStartIndex];
      }
    }
  }
  if (fromStartIndex > fromEndIndex) {
    before = toChildren[toEndIndex + 1] === undefined ? null : toChildren[toEndIndex + 1].element;
    for (; toStartIndex <= toEndIndex; toStartIndex++) {
      container.insertBefore(toChildren[toStartIndex].render(parent), before);
    }
  } else if (toStartIndex > toEndIndex) {
    for (; fromStartIndex <= fromEndIndex; fromStartIndex++) {
      fromChildren[fromStartIndex].remove();
    }
  }
  return toChildren;
}

/**
 * Returns indexes of keyed nodes.
 *
 * @param  Array  children An array of nodes.
 * @return Object          An object of keyed nodes indexes.
 */
function keysIndexes(children, startIndex, endIndex) {
  var i, keys = Object.create(null), key;
  for (i = startIndex; i <= endIndex; ++i) {
    key = children[i].key;
    if (key !== undefined) {
      keys[key] = i;
    }
  }
  return keys;
}

/**
 * Patches an existing node to be "identical" to a new node.
 *
 * @param  Object from      The initial virtual node to patch.
 * @param  Object to        The new virtual node value.
 * @param  Number fromIndex The index of the `from` node inside parent's children.
 * @param  Object container The container.
 * @return Object           The corresponding DOMElement.
 */
patch.node = function(from, to) {
  var element = from.element;

  if (from === to) {
    return element;
  }
  var next = from.patch(to);

  var container = element.parentNode;
  if (container && next !== element) {
    container.replaceChild(next, element);
  }
  return next;
}

module.exports = patch;
