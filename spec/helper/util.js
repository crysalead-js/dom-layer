var h = require("./h");
var Tag = require("../../src/node/tag");

var _ = {};

/**
 * Safely translates style values using the DOM in the browser
 */
_.style = function(name, value) {
  var node = h().render();
  node.style[name] = value;
  return node.style[name];
}

/**
 * Determines if namespace is supported by the DOM
 */
_.hasNamespace = function() {
    var node = new Tag().render();
    return 'namespaceURI' in node;
}

/**
 * Safely transaltes node property using the DOM in the browser
 */
_.property = function(tag, prop, value) {
  var node = h({ tagName: tag }).render();
  node[prop] = value;
  return node[prop];
}

/**
 * Builds a array of virtual nodes
 */
_.buildNodes = function(array) {
  var i, id, key, context;
  var children = [];

  for (i = 0 ; i < array.length; i++) {
    context = { tagName : "div" };
    id = key = array[i];
    if (key != null && (typeof key !== "string" || key.charAt(0) !== "#")) {
      context.key = key;
    }
    context.attrs = { id: String(id) };
    children.push(key != null ? h(context, [context.attrs.id]) : key);
  }

  return h({ tagName : "div" }, children);
}

_.rewrap = function(value) {
  return Array.prototype.slice.call(value);
}


module.exports = _;