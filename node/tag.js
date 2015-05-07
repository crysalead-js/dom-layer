var create = require("../tree/create");
var patch = require("../tree/patch/patch");
var applyProps = require("./setter/apply-props");
var applyAttrs = require("./setter/apply-attrs");

/**
 * The Virtual Tag constructor.
 *
 * @param  String tagName  The tag name.
 * @param  Object config   The virtual node definition.
 * @param  Array  children An array for children.
 */
function Tag(tagName, config, children) {
  this.tagName = tagName || "div";
  config = config || {};
  this.children = children || [];
  this.props = config.props;
  this.attrs = config.attrs;
  this.events = config.events;
  this.callbacks = config.callbacks;
  this.data = config.data;
  this.element = undefined;
  this.parent = undefined;

  this.key = config.key != null ? config.key : undefined;

  this.namespace = config.namespace || "";
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
 * Field names to forward on patch.
 */
Tag.prototype.forward = ["props", "callbacks", "data", "element", "parent"];

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
  if (this.props) {
    applyProps(this, element, {}, this.props);
  }
  if (this.attrs) {
    applyAttrs(this, element, {}, this.attrs);
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
  this.element = this.create();
  if (this.events) {
    this.element._vtreenode = this;
  }
  this.parent = parent;
  create(this.element, this.children, this, inSvg || this.element.tagName === "SVG");
  if (this.callbacks && this.callbacks.created) {
    this.callbacks.created(this);
  }
  return this.element;
};

/**
 * Patches a node according to the a new representation.
 *
 * @param  Object to A new node representation.
 * @return Object    A DOM element, can be a new one or simply the old patched one.
 */
Tag.prototype.patch = function(to) {
  if (this.tagName !== to.tagName || this.key !== to.key || this.namespace !== to.namespace) {
    this.remove(false);
    return to.render();
  }
  for (var i = 0, len = this.forward.length; i < len; i++) {
    to[this.forward[i]] = this[this.forward[i]];
  }
  patch(this.element, this.children, to.children);
  applyAttrs(to, this.element, this.attrs, to.attrs);
  return this.element;
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
  var element = this.element;

  if (!element) {
    return;
  }
  var parentNode = element.parentNode;
  if (!parentNode) {
    return;
  }
  if (!this.callbacks || !this.callbacks.destroy) {
    return parentNode.removeChild(element);
  }
  return this.callbacks.destroy(element, function() {
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
  if (node.callbacks && node.callbacks.remove) {
    node.callbacks.remove(node, node.element);
  }
  for(var i = 0, len = node.children.length; i < len; i++) {
    broadcastRemove(node.children[i]);
  }
}

module.exports = Tag;