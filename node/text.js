var escapeHtml = require("escape-html");

/**
 * The Virtual Text constructor.
 *
 * @param  String tagName  The tag name.
 * @param  Array  children An array for children.
 */
function Text(text) {
  this.text = text;
  this.element = undefined;
}

Text.prototype.type = "Text";

/**
 * Creates and return the corresponding DOM node.
 *
 * @return Object A DOM node.
 */
Text.prototype.create = function() {
  return document.createTextNode(this.text);
}

/**
 * Renders virtual text node.
 *
 * @return Object        A textual DOM element.
 */
Text.prototype.render = function() {
  return this.element = this.create();
}

/**
 * Attaches an existing textual DOM element.
 *
 * @param  Object element A textual DOM element.
 * @return Object         The textual DOM element.
 */
Text.prototype.attach = function(element) {
  return this.element = element;
}

/**
 * Patches a node according to the a new representation.
 *
 * @param  Object to A new node representation.
 * @return Object    A DOM element, can be a new one or simply the old patched one.
 */
Text.prototype.patch = function(to) {
  if (this.type !== to.type) {
    this.remove(false);
    return to.render();
  }
  to.element = this.element;
  if (this.text !== to.text) {
    this.element.replaceData(0, this.element.length, to.text);
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
  return escapeHtml(this.text);
}

module.exports = Text;