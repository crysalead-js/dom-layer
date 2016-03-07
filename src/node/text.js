var escapeHtml = require("escape-html");

/**
 * The Virtual Text constructor.
 *
 * @param  String tagName  The tag name.
 * @param  Array  children An array for children.
 */
function Text(data) {
  this.data = data;
  this.element = undefined;
  this.parent = undefined;
}

Text.prototype.type = "Text";

/**
 * Creates and return the corresponding DOM node.
 *
 * @return Object A DOM node.
 */
Text.prototype.create = function() {
  return document.createTextNode(this.data);
}

/**
 * Renders virtual text node.
 *
 * @param  Object  container The container to render in.
 * @param  Object  parent    A parent node.
 * @return Object            A textual DOM element.
 */
Text.prototype.render = function(container, parent) {
  this.parent = parent;
  this.element = this.create();
  container = container ? container : document.createDocumentFragment();
  container.appendChild(this.element);
  return this.element
}

/**
 * Attaches an existing textual DOM element.
 *
 * @param  Object element A textual DOM element.
 * @return Object         The textual DOM element.
 */
Text.prototype.attach = function(element, parent) {
  this.parent = parent;
  return this.element = element;
}

/**
 * Check if the node match another node.
 *
 * Note: nodes which doesn't match must be rendered from scratch (i.e. can't be patched).
 *
 * @param  Object  to A node representation to check matching.
 * @return Boolean
 */
Text.prototype.match = function(to) {
  return this.type === to.type;
}

/**
 * Patches a node according to the a new representation.
 *
 * @param  Object to A new node representation.
 * @return Object    A DOM element, can be a new one or simply the old patched one.
 */
Text.prototype.patch = function(to) {
  if (!this.match(to)) {
    this.remove(false);
    return to.render(this.element.parentNode, this.parent);
  }
  to.element = this.element;
  to.parent = this.parent;

  if (this.data !== to.data) {
    this.element.data = to.data;
  }
  return this.element;
}

/**
 * Removes the DOM node attached to the virtual node.
 */
Text.prototype.remove = function(destroy) {
  if(destroy !== false) {
    this.destroy();
  }
};

/**
 * Destroys the DOM node attached to the virtual node.
 */
Text.prototype.destroy = function() {
  var parentNode = this.element.parentNode;
  return parentNode.removeChild(this.element);
};

/**
 * Returns an html representation of the text node.
 */
Text.prototype.toHtml = function() {
  return escapeHtml(this.data);
}

module.exports = Text;