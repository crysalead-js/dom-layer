var create = require("../tree/create");
var patch = require("../tree/patch/patch");
var applyProps = require("./setter/apply-props");
var applyAttrs = require("./setter/apply-attrs");

/**
 * The Virtual Tag constructor.
 *
 * @param  Object context  The virtual node definition.
 * @param  Array  children An array for children.
 * @param  Array  key      The node key.
 */
function Tag(tagName, context, children) {
  this.tagName = tagName || "div";
  this.c = context = context || {};
  this.children = children || [];
  this.c.props = context.props || undefined;
  this.c.attrs = context.attrs || undefined;
  this.c.events = context.events || undefined;
  this.c.callbacks = context.callbacks || undefined;
  this.c.parent = undefined;
  this.c.element = undefined;
  this.attrs = this.c.attrs;
  this.key = context.key != null ? context.key : undefined;

  this.namespace = context.namespace || "";
  if (this.namespace) {
    return
  }
  if (this.tagName === "svg" ) {
    this.namespace = "http://www.w3.org/2000/svg";
  } else if (this.tagName === "math") {
    this.namespace = "http://www.w3.org/1998/Math/MathML";
  }
};

/**
 * Creates and return the corresponding DOM node.
 *
 * @return Object A DOM node.
 */
Tag.prototype.create = function() {
  var element;
  if (!this.namespace) {
    element = document.createElement(this.tagName);
  } else {
    element = document.createElementNS(this.namespace, this.tagName);
  }
  if (this.c.props) {
    applyProps(this, element, {}, this.c.props);
  }
  if (this.c.attrs) {
    applyAttrs(this, element, {}, this.c.attrs);
  }

  return element;
};

/**
 * Renders the virtual node.
 *
 * @param  Object  parent A parent node.
 * @param  Boolean inSvg  Indicates if the rendering is done inside a SVG tag.
 * @return Object         A root DOM node.
 */
Tag.prototype.render = function(parent, inSvg) {
  var context = this.c;
  context.element = this.create();
  if (context.events) {
    context.element._vtreenode = this;
  }
  context.parent = parent;
  create(context.element, this.children, this, inSvg || context.element.tagName === "SVG");
  if (context.callbacks && context.callbacks.created) {
    context.callbacks.created(this);
  }
  return context.element;
};

/**
 * Patches a node according to the a new representation.
 *
 * @param  Object to A new node representation.
 * @return Object    A DOM element, can be a new one or simply the old patched one.
 */
Tag.prototype.patch = function(to) {
  if (this.tagName !== to.tagName || this.key !== to.key || this.namespace !== to.namespace) {
    to.c = this.c;
    this.remove(false);
    return to.render();
  }
  var element = this.c.element;
  patch(element, this.children, to.children);
  applyAttrs(to, element, this.attrs, to.attrs);
  return element;
}

/**
 * Removes the DOM node attached to the virtual node.
 */
Tag.prototype.remove = function(destroy) {
  broadcastRemove(this);
  if(destroy !== false) {
    this.destroy();
  }
};

/**
 * Destroys the DOM node attached to the virtual node.
 */
Tag.prototype.destroy = function() {
  var context = this.c;
  var element = context.element;
  if (!element) {
    return;
  }
  var parentNode = element.parentNode;
  if (!parentNode) {
    return;
  }
  if (!context.callbacks || !context.callbacks.destroy) {
    return parentNode.removeChild(element);
  }
  return context.callbacks.destroy(element, function() {
    return parentNode.removeChild(element);
  });
};

/**
 * Broadcasts the remove "event".
 */
function broadcastRemove(node) {
  if (!node.children) {
    return;
  }
  var context = node.c;
  if (context.callbacks && context.callbacks.remove) {
    context.callbacks.remove(node, node.element);
  }
  for(var i = 0, len = node.children.length; i < len; i++) {
    broadcastRemove(node.children[i]);
  }
}

module.exports = Tag;