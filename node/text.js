
function Text(text, key) {
  this.text = text;
  this.key = key;
  this.c = {
    element: undefined,
    parent: undefined
  };
}

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
 * @param  Object parent A parent node.
 * @param  Object vtext  A previously rendered virtual text node to overwrite.
 * @return Object        A text node.
 */
Text.prototype.render = function(parent) {
  return this.c.element = this.create();
}

/**
 * Patches a node according to the a new representation.
 *
 * @param  Object to A new node representation.
 * @return Object    A DOM element, can be a new one or simply the old patched one.
 */
Text.prototype.patch = function(to) {
  if (to.tagName !== undefined) {
    to.c = this.c;
    this.remove(false);
    return to.render();
  }
  var element = this.c.element;
  if (this.text !== to.text) {
    element.replaceData(0, element.length, to.text);
  }
  return element;
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
  var context = this.c;
  var parentNode = context.element.parentNode;
  return parentNode.removeChild(context.element);
};

module.exports = Text;