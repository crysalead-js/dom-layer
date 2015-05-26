var voidElements = require("void-elements");
var attach = require("../tree/attach");
var create = require("../tree/create");
var update = require("../tree/update");
var props = require("./patcher/props");
var attrs = require("./patcher/attrs");
var attrsNS = require("./patcher/attrs-n-s");
var selectValue = require("./patcher/select-value");
var stringifyAttrs = require("../util/stringify-attrs");

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

  selectValue(this);
  props.patch(element, {}, this.props);
  attrs.patch(element, {}, this.attrs);
  attrsNS.patch(element, {}, this.attrsNS);

  create(element, this.children, this);

  if (this.callbacks && this.callbacks.created) {
    this.callbacks.created(this, element);
  }
  return element;
};

/**
 * Attaches an existing DOM element.
 *
 * @param  Object element A textual DOM element.
 * @return Object         The textual DOM element.
 */
Tag.prototype.attach = function(element, parent) {
  this.parent = parent;
  this.element = element;
  if (this.events) {
    element.domLayerNode = this;
  }
  props.patch(element, {}, this.props);

  attach(element, this.children, this);

  if (this.callbacks && this.callbacks.created) {
    this.callbacks.created(this, element);
  }
  return element;
}

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

  selectValue(to);
  props.patch(to.element, this.props, to.props);
  attrs.patch(to.element, this.attrs, to.attrs);
  attrsNS.patch(to.element, this.attrsNS, to.attrsNS);

  update(to.element, this.children, to.children);

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

/**
 * Returns an html representation of a tag node.
 */
Tag.prototype.toHtml = function() {

  var attributes = stringifyAttrs(this.attrs, this.tagName);
  var html = "<" + this.tagName + (attributes ? " " + attributes : "") + ">";

  for (var i = 0, len = this.children.length; i < len ; i++) {
    html += this.children[i].toHtml();
  }
  html += voidElements[this.tagName] ? "" : "</" + this.tagName + ">";
  return html;

};

module.exports = Tag;
