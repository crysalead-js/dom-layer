var voidElements = require("void-elements");
var attach = require("../tree/attach");
var render = require("../tree/render");
var update = require("../tree/update");
var props = require("./patcher/props");
var attrs = require("./patcher/attrs");
var attrsNS = require("./patcher/attrs-n-s");
var selectValue = require("./patcher/select-value");
var stringifyAttrs = require("../util/stringify-attrs");
var Text = require("./text");

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
  this.hooks = config.hooks;
  this.data = config.data;
  this.element = undefined;
  this.parent = undefined;

  this.key = config.key != null ? config.key : undefined;

  this.namespace = config.attrs && config.attrs.xmlns || null;
  this.is = config.attrs && config.attrs.is || null;
};

Tag.prototype.type = "Tag";

/**
 * Creates and return the corresponding DOM node.
 *
 * @return Object A DOM node.
 */
Tag.prototype.create = function() {
  var element;
  if (this.namespace) {
    if (this.is) {
      element = document.createElementNS(this.namespace, this.tagName, this.is);
    } else {
      element = document.createElementNS(this.namespace, this.tagName);
    }
  } else {
    if (this.is) {
      element = document.createElement(this.tagName, this.is);
    } else {
      element = document.createElement(this.tagName);
    }
  }
  return element;
};

/**
 * Renders the virtual node.
 *
 * @param  Object  container The container to render in.
 * @param  Object  parent    A parent node.
 * @return Object            The rendered DOM element.
 */
Tag.prototype.render = function(container, parent) {
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

  if (this.events || this.data) {
    element.domLayerNode = this;
  }

  if (this.tagName === "select") {
    selectValue(this);
  }
  if (this.props) {
    props.patch(element, {}, this.props);
  }
  if (this.attrs) {
    attrs.patch(element, {}, this.attrs);
  }
  if (this.attrsNS) {
    attrsNS.patch(element, {}, this.attrsNS);
  }

  container = container ? container : document.createDocumentFragment();
  container.appendChild(element);

  render(element, this.children, this);

  if (this.hooks && this.hooks.created) {
    this.hooks.created(this, element);
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
  if (this.events || this.data) {
    element.domLayerNode = this;
  }
  props.patch(element, {}, this.props);

  attach(element, this.children, this);

  if (this.hooks && this.hooks.created) {
    this.hooks.created(this, element);
  }
  return element;
}

/**
 * Check if the node match another node.
 *
 * Note: nodes which doesn't match must be rendered from scratch (i.e. can't be patched).
 *
 * @param  Object  to A node representation to check matching.
 * @return Boolean
 */
Tag.prototype.match = function(to) {
  return !(
    this.type !== to.type ||
    this.tagName !== to.tagName ||
    this.key !== to.key ||
    this.namespace !== to.namespace ||
    this.is !== to.is
  );
}

/**
 * Patches a node according to the a new representation.
 *
 * @param  Object to A new node representation.
 * @return Object    A DOM element, can be a new one or simply the old patched one.
 */
Tag.prototype.patch = function(to) {
  if (!this.match(to)) {
    this.remove(false);
    return to.render(this.element.parentNode, this.parent);
  }
  to.element = this.element;
  to.parent = this.parent;

  if (this.tagName === "select") {
    selectValue(to);
  }
  if (this.props || to.props) {
    props.patch(to.element, this.props, to.props);
  }
  if (this.attrs || to.attrs) {
    attrs.patch(to.element, this.attrs, to.attrs);
  }
  if (this.attrsNS || to.attrsNS) {
    attrsNS.patch(to.element, this.attrsNS, to.attrsNS);
  }

  update(to.element, this.children, to.children, to);

  if (to.events || to.data) {
    to.element.domLayerNode = to;
  } else if (this.events || this.data) {
    to.element.domLayerNode = undefined;
  }

  if (this.hooks && this.hooks.updated) {
    this.hooks.updated(this, to.element);
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
  if (!this.hooks || !this.hooks.destroy) {
    return parentNode.removeChild(element);
  }
  return this.hooks.destroy(element, function() {
    return parentNode.removeChild(element);
  });
};

/**
 * Broadcasts the remove "event".
 */
function broadcastRemove(node) {
  if (node.children) {
    for(var i = 0, len = node.children.length; i < len; i++) {
      broadcastRemove(node.children[i]);
    }
  }
  if (node.hooks && node.hooks.remove) {
    node.hooks.remove(node, node.element);
  }
}

/**
 * Returns an html representation of a tag node.
 */
Tag.prototype.toHtml = function() {

  var children = this.children;
  var attributes = {};

  for (var key in this.attrs) {
    if (key === 'value') {
      if (this.tagName === 'select') {
        selectValue(this);
        continue;
      } else if (this.tagName === 'textarea' || this.attrs.contenteditable) {
        children = [new Text(this.attrs[key])];
        continue;
      }
    }
    attributes[key] = this.attrs[key];
  }

  var attrs = stringifyAttrs(attributes, this.tagName);
  var attrsNS = stringifyAttrs(this.attrsNS, this.tagName);
  var html = "<" + this.tagName + (attrs ? " " + attrs : "") + (attrsNS ? " " + attrsNS : "") + ">";

  var len = children.length;

  if (this.props && this.props.innerHTML && len === 0) {
    html += this.props.innerHTML;
  } else {
    for (var i = 0; i < len ; i++) {
      html += children[i].toHtml();
    }
  }
  html += voidElements[this.tagName] ? "" : "</" + this.tagName + ">";
  return html;

};

module.exports = Tag;
