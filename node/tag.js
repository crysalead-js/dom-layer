var create = require("../tree/create");
var update = require("../tree/update");
var props = require("./util/props");
var attrs = require("./util/attrs");
var attrsNS = require("./util/attrs-n-s");

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
  this.attrsNS = config.attrsNS;
  this.events = config.events;
  this.callbacks = config.callbacks;
  this.data = config.data;
  this.element = undefined;
  this.parent = undefined;

  this.key = config.key != null ? config.key : undefined;

  this.namespace = config.namespace || "";
};

Tag.prototype.type = "Tag";

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
  return element;
};

/**
 * Renders the virtual node.
 *
 * @param  Object  parent A parent node.
 * @return Object         A root DOM node.
 */
Tag.prototype.render = function(parent) {
  this.parent = parent;

  if (!this.namespace) {
    if (this.tagName === "svg" ) {
      this.namespace = "http://www.w3.org/2000/svg";
    } else if (this.tagName === "math") {
      this.namespace = "http://www.w3.org/1998/Math/MathML";
    } else if (parent) {
      this.namespace = parent.namespace;
    }
  }

  var element = this.element = this.create();
  if (this.events) {
    element.domLayerNode = this;
  }
  create(element, this.children, this);

  props.patch(element, {}, this.props);
  attrs.patch(element, {}, this.attrs);
  attrsNS.patch(element, {}, this.attrsNS);

  if (this.callbacks && this.callbacks.created) {
    this.callbacks.created(this, element);
  }
  return element;
};

/**
 * Patches a node according to the a new representation.
 *
 * @param  Object to A new node representation.
 * @return Object    A DOM element, can be a new one or simply the old patched one.
 */
Tag.prototype.patch = function(to) {
  if (this.type !== to.type || this.tagName !== to.tagName || this.key !== to.key || this.namespace !== to.namespace) {
    this.remove(false);
    return to.render();
  }
  to.element = this.element;
  update(to.element, this.children, to.children, to);
  props.patch(to.element, this.props, to.props);
  attrs.patch(to.element, this.attrs, to.attrs);
  attrsNS.patch(to.element, this.attrsNS, to.attrsNS);
  if (to.events) {
    to.element.domLayerNode = to;
  } else if (this.events) {
    to.element.domLayerNode = undefined;
  }
  return to.element;
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
