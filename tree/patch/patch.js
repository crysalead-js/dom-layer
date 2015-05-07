var isEmpty = require("is-empty");
var domCollection = require("dom-collection");

var isArray = Array.isArray;

/**
 * Patches & Reorders child nodes of a container (i.e represented by `fromChildren`) to match `toChildren`.
 *
 * Since finding the longest common subsequence problem is NP-hard, this implementation
 * is a simple heuristic for reordering nodes with a "minimum" of moves in O(n).
 *
 * @param Array  fromChildren The initial order of children to reorder.
 * @param Array  toChildren   The array of children to take the order from.
 * @param Object container    The container.
 */
function patch(container, fromChildren, toChildren) {
  var indexes = updateChildren(fromChildren, toChildren);
  var direction = indexes.direction;
  var fromKeys = indexes.keys;
  var fromFree = indexes.free;
  var toItem, toIndex = 0, targetIndex = 0;
  var direction = 1;
  var freeLength = fromFree.length, freeIndex = 0;

  var unshift = indexes.direction < 0 ? 1 : 0;

  if (unshift) {
    toIndex = toChildren.length - 1;
    targetIndex = container.childNodes.length - 1;
    freeIndex = fromFree.length - 1
    direction = -1;
  }

  // Reordering nodes
  for (var i = 0, len = toChildren.length; i < len; i++) {
    toItem = toChildren[toIndex];
    if (toItem.key !== undefined) {
      if (fromKeys[toItem.key] !== undefined) {
        domCollection.moveAt(fromKeys[toItem.key], targetIndex, container);
      } else {
        domCollection.insertAt(toItem.render(), Math.max(targetIndex, 0), container);
        targetIndex += unshift;
      }
    } else if (freeLength > 0) {
      domCollection.moveAt(fromFree[freeIndex], targetIndex, container);
      freeLength--;
      freeIndex += direction;
    } else {
      domCollection.insertAt(toItem.render(), Math.max(targetIndex, 0), container);
      targetIndex += unshift;
    }
    targetIndex += direction;
    toIndex += direction;
  }
  return toChildren;
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
  var element = from.c.element;

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

/**
 * Updates `fromChildren` according to `toChildren` nodes which means:
 *
 * 1)- removes all keys which are not present in `toChildren` and unkeyed nodes which exceed `toChildren` ones.
 * 2)- builds an index of all keyed element which are still present in `toChildren`.
 * 3)- attempt to auto-detect the direction of moves.
 *
 * Note: Only updates here, no reordering.
 *
 * @param  Array  fromChildren The original array to update.
 * @param  Array  toChildren   The new array to match on.
 * @result Array               An array which contain:
 *                             - an object of all remained keyed element indexed by key.
 *                             - an array of all available unkeyed element.
 *                             - the likely direction auto-detection:
 *                               direction < 1 means mainly unshift based moves.
 *                               direction > 1 means mainly shift based moves.
 */
function updateChildren(fromChildren, toChildren) {
  var i, len;
  var fromItem, toItem, fromIndex = 0, toIndex, direction = 0;
  var indexes = indexChildren(toChildren);
  var toKeys = indexes.keys, toFree = indexes.free;
  var keys = Object.create(null), free = [];

  for (i = 0, len = fromChildren.length; i < len; i++) {
    fromItem = fromChildren[i];
    if (fromItem.key === undefined) {
      free.push(fromItem);
    } else if (toKeys[fromItem.key] !== undefined) {
      toIndex = toKeys[fromItem.key];
      keys[fromItem.key] = fromItem.c.element;
      toItem = toChildren[toIndex];
      patch.node(fromItem, toItem);
      direction = direction + (toIndex - i > 0 ? 1 : -1);
    } else {
      fromItem.remove();
      continue;
    }
    fromIndex++;
  }

  var balance = free.length - toFree.length;

  if (balance > 0) {
    var start = direction < 0 ? toFree.length : 0;
    for (i = 0; i < balance; i++) {
      free[start + i].remove();
    }
    free.splice(start, balance);
  }

  for (i = 0, len = free.length; i < len; i++) {
    patch.node(free[i], toChildren[toFree[i]]);
    free[i] = free[i].c.element;
  }

  return { keys: keys, free: free, direction: direction };
}

/**
 * Returns an array of all positions of keys inside `children` indexed by node keys.
 *
 * @param  Array  children An array of nodes.
 * @return Object          An array of object which contain:
 *                         - an object of keyed nodes indexed by keys.
 *                         - an array of unkeyed nodes.
 */
function indexChildren(children) {
  var i, len, child, keys = Object.create(null), free = [];
  for (i = 0, len = children.length; i < len; i++) {
    child = children[i];
    if (child.key !== undefined) {
      keys[child.key] = i;
    } else {
      free.push(i);
    }
  }
  return { keys: keys, free: free };
}

module.exports = patch;
