(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.domLayer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var domElement = require("dom-element");
var applyStyle = require("./apply-style");

function applyAttrsNS(element, previous, attrs) {
  if (!previous && !attrs) {
    return attrs;
  }
  var attrName, ns, name, value, split;
  previous = previous || {};
  attrs = attrs || {};

  for (attrName in previous) {
    if (previous[attrName] && !attrs[attrName]) {
      split = splitAttrName(attrName);
      ns = applyAttrsNS.namespaces[split[0]];
      name = split[1];
      element.removeAttributeNS(ns, name);
    }
  }
  for (attrName in attrs) {
    value = attrs[attrName];
    if (previous[attrName] === value) {
      continue;
    }
    split = splitAttrName(attrName);
    ns = applyAttrsNS.namespaces[split[0]];
    name = split[1];
    element.setAttributeNS(ns, name, value);
  }
  return attrs;
}

function splitAttrName(attrName) {
  return attrName.split(':');
}

applyAttrsNS.namespaces = {
  xlink: 'http://www.w3.org/1999/xlink',
  xml: 'http://www.w3.org/XML/1998/namespace',
  xmlns: 'http://www.w3.org/2000/xmlns/'
};

module.exports = applyAttrsNS;

},{"./apply-style":5,"dom-element":9}],2:[function(require,module,exports){
var domElement = require("dom-element");
var applyStyle = require("./apply-style");

function applyAttrs(element, previous, attrs) {
  if (!previous && !attrs) {
    return attrs;
  }
  var name, value;
  previous = previous || {};
  attrs = attrs || {};

  for (name in previous) {
    if (previous[name] && !attrs[name]) {
      element.removeAttribute(name);
    }
  }
  for (name in attrs) {
    value = attrs[name];
    if (previous[name] === value) {
      continue;
    }
    if (name === "style") {
      applyStyle(element, previous[name], value);
    } else if (name === "value") {
      domElement.value(element, value);
    } else {
      element.setAttribute(name, value);
    }
  }
  return attrs;
}

module.exports = applyAttrs;

},{"./apply-style":5,"dom-element":9}],3:[function(require,module,exports){
function applyDataset(element, previous, dataset) {
  if (!previous && !dataset) {
    return dataset;
  }
  var name;
  previous = previous || {};
  dataset = dataset || {};

  for (name in previous) {
    if (dataset[name] === undefined) {
      element.dataset[name] = undefined;
    }
  }

  for (name in dataset) {
    if (previous[name] === dataset[name]) {
      continue;
    }
    element.dataset[name] = dataset[name];
  }

  return dataset;
}

module.exports = applyDataset;

},{}],4:[function(require,module,exports){
var applyDataset = require("./apply-dataset");

function applyProps(element, previous, props) {
  if (!previous && !props) {
    return props;
  }
  var name;
  previous = previous || {};
  props = props || {};

  for (name in previous) {
    if (name !== "dataset" && props[name] === undefined) {
      element[name] = undefined;
    }
  }

  for (name in props) {
    if (name === "dataset" || previous[name] === props[name]) {
      continue;
    }
    element[name] = props[name];
  }

  applyDataset(element, previous["dataset"], props["dataset"]);

  return props;
}

module.exports = applyProps;

},{"./apply-dataset":3}],5:[function(require,module,exports){
var domElement = require("dom-element");

function applyStyle(element, previous, style) {
  if (!previous && !style) {
    return style;
  }
  var rule;
  if (typeof style === "object") {
    if (typeof previous === "object") {
      for (rule in previous) {
        if (!style[rule]) {
          domElement.css(element, rule, null);
        }
      }
      domElement.css(element, style);
    } else {
      if (previous) {
        domElement.attr(element, "style", "");
      }
      domElement.css(element, style);
    }
  } else {
    domElement.attr(element, "style", style || "");
  }
}

module.exports = applyStyle;

},{"dom-element":9}],6:[function(require,module,exports){
var create = require("../tree/create");
var update = require("../tree/update");
var applyProps = require("./setter/apply-props");
var applyAttrs = require("./setter/apply-attrs");
var applyAttrsNS = require("./setter/apply-attrs-n-s");

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

  applyProps(element, {}, this.props);
  applyAttrs(element, {}, this.attrs);
  applyAttrsNS(element, {}, this.attrsNS);

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
  applyProps(to.element, this.props, to.props);
  applyAttrs(to.element, this.attrs, to.attrs);
  applyAttrsNS(to.element, this.attrsNS, to.attrsNS);
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

},{"../tree/create":15,"../tree/update":19,"./setter/apply-attrs":2,"./setter/apply-attrs-n-s":1,"./setter/apply-props":4}],7:[function(require,module,exports){
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
 * @return Object        A text node.
 */
Text.prototype.render = function() {
  return this.element = this.create();
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

module.exports = Text;
},{}],8:[function(require,module,exports){
/**
 * Index based collection manipulation methods for DOM childNodes.
 */

var collection = Object.create(null);

/**
 * Inserts an DOM element at a specific index.
 *
 * @param  Object element The DOM element insert.
 * @param  Number index   The insertion index.
 * @param  Object parent  The parent container.
 * @return Object         The inserted DOM element.
 */
collection.insertAt = function(element, index, parent) {
  var childNodes = parent.childNodes;
  var target = index >= childNodes.length ? null : childNodes[index];
  parent.insertBefore(element, target);
  return element;
}

/**
 * Moves a DOM element to a specific index.
 *
 * @param  Object element The DOM element to move.
 * @param  Number index   The target index.
 * @param  Object parent  The parent container.
 * @return Object         The moved DOM element.
 */
collection.moveAt = function(element, index, parent) {
  parent ? parent : element.parentNode;
  var target = parent.childNodes[index];
  if (element === target) {
    return element;
  }
  parent.removeChild(element);
  collection.insertAt(element, index, parent);
  return element;
}

/**
 * Replaces a DOM element at a specific index.
 *
 * @param  Object element The DOM element to replace by.
 * @param  Number index   The index of the element to replace.
 * @param  Object parent  The parent container.
 * @return Object         The replaced DOM element.
 */
collection.replaceAt = function(element, index, parent) {
  parent ? parent : element.parentNode;
  var target = parent.childNodes[index];
  if (element === target) {
    return element;
  }
  return parent.replaceChild(element, target);
}

/**
 * Removes a DOM element at a specific index.
 *
 * @param  Number index  The index of the element to remove.
 * @param  Object parent The parent container.
 */
collection.removeAt = function(index, parent) {
  var element = parent.childNodes[index];
  return element ? parent.removeChild(element) : undefined;
}

/**
 * Extends an object with this module functions.
 *
 * @param Object object The object to extend.
 */
collection.extend = function(object) {
  for (key in collection) {
    object[key] = collection[key];
  }
}

module.exports = collection;

},{}],9:[function(require,module,exports){
var toCamelCase = require('to-camel-case');
var hasRemovePropertyInStyle = "removeProperty" in document.createElement("a").style;
/**
 * DOM element manipulation functions.
 */

/**
 * Gets/Sets a DOM element attribute.
 *
 * @param  Object element A DOM element.
 * @param  String name    The name of an attribute.
 * @param  String value   The value of the attribute to set, `undefined` to remove it or none
 *                        to get the current attribute value.
 * @return String         The current/new attribute value or `undefined` when removed.
 */
function attr(element, name, value) {
  name = toCamelCase(name === 'for' ? 'htmlFor' : name);
  if (arguments.length === 2) {
    return element.getAttribute(name);
  }
  if (value === undefined) {
    return element.removeAttribute(name);
  }
  element.setAttribute(name, value);
  return value;
}

/**
 * Gets/Sets a DOM element attribute with a specified namespace.
 *
 * @param  Object element A DOM element.
 * @param  String name    The name of an attribute.
 * @param  String value   The value of the attribute to set, `undefined` to remove it or none
 *                        to get the current attribute value.
 * @return String         The current/new attribute value or `undefined` when removed.
 */

function attrNS(element, ns, name, value) {
  name = toCamelCase(name);
  if (arguments.length === 3) {
    return element.getAttributeNS(ns, name);
  }
  if (value === undefined) {
    return element.removeAttributeNS(ns, name);
  }
  element.setAttributeNS(ns, name, value);
  return value;
}

/**
 * Gets/Sets a DOM element property.
 *
 * @param  Object element A DOM element.
 * @param  String name    The name of a property.
 * @param  String value   The value of the property to set, or none to get the current
 *                        property value.
 * @return String         The current/new property value.
 */
function prop(element, name, value){
  if (arguments.length === 2) {
    return element[name];
  }
  return element[name] = value;
}

/**
 * Gets/Sets a DOM element property.
 *
 * @param  Object element A DOM element.
 * @param  String name    The name of a property.
 * @param  String value   The value of the property to set, or none to get the current
 *                        property value.
 * @return String         The current/new property value.
 */
function css(element) {
  var name;
  if (arguments.length === 3) {
    name = toCamelCase((arguments[1] === 'float') ? 'cssFloat' : arguments[1]);
    var value = arguments[2];
    if (value) {
      element.style[name] = value;
      return value;
    }
    if (hasRemovePropertyInStyle) {
      element.style.removeProperty(name);
    } else {
      element.style[name] = "";
    }
    return value;
  }
  if (typeof arguments[1] === "string") {
    name = toCamelCase((arguments[1] === 'float') ? 'cssFloat' : arguments[1]);
    return element.style[name];
  }

  var style = arguments[1];
  for (name in style) {
    css(element, name, style[name]);
  }
  return style;
}

/**
 * Returns the type of a DOM element.
 *
 * @param  Object element A DOM element.
 * @return String         The DOM element type.
 */
function type(element) {
  var name = element.nodeName.toLowerCase();
  if (name !== "input") {
    if (name === "select" && element.multiple) {
      return "select-multiple";
    }
    return name;
  }
  var type = element.getAttribute('type');
  if (!type) {
    return "text";
  }
  return type.toLowerCase();
}

/**
 * Gets/Sets a DOM element attribute.
 *
 * @param  Object element A DOM element.
 * @param  String name    The name of an attribute.
 * @param  String value   The value of the attribute to set, `null` to remove it or none
 *                        to get the current attribute value.
 * @return String         The current/new attribute value or `undefined` when removed.
 */
function data(element, name, value) {
  if (arguments.length === 3) {
    return attr(element, "data-" + name, value);
  }
  return attr(element, "data-" + name);
}

/**
 * Gets/Sets a DOM element text content.
 *
 * @param  Object element A DOM element.
 * @param  String value   The text value to set or none to get the current text content value.
 * @return String         The current/new text content.
 */
function text(element, value) {
  var text = (element.textContent !== undefined ? 'textContent' : 'innerText')

  if (arguments.length === 1) {
    return element[text];
  }
  return element[text] = value
}

/**
 * Gets/sets DOM element value.
 *
 * @param  Object element A DOM element
 * @param  Object value   The value to set or none to get the current value.
 * @return mixed          The new/current DOM element value.
 */
function value(element, value) {
  if (arguments.length === 1) {
    return get(element);
  }
  return set(element, value);
}

/**
 * Gets DOM element value.
 *
 * @param  Object element A DOM element
 * @return mixed          The DOM element value
 */
function get(element) {
  var name = type(element);
  switch (name) {
    case "checkbox":
    case "radio":
      if (!element.checked) {
        return false;
      }
      var value = element.getAttribute('value');
      return value == null ? true : value;
    case "select":
    case "select-multiple":
      var options = element.options;
      var values = [];
      for (var i = 0, len = options.length; i < len; i++) {
        if (options[i].selected) {
          values.push(options[i].value);
        }
      }
      return name === "select-multiple" ? values : values[0];
    default:
      return element.value;
  }
}

/**
 * Sets a DOM element value.
 *
 * @param  Object element A DOM element
 * @param  Object value   The value to set.
 * @return mixed          The new DOM element value.
 */
function set(element, value) {
  var name = type(element);
  switch (name) {
    case "checkbox":
    case "radio":
      return element.checked = value ? true : false;
    case "select":
    case "select-multiple":
      var found;
      var options = element.options;
      var values = Array.isArray(value) ? value : [value];
      for (var i = 0, leni = options.length; i < leni; i++) {
        found = 0;
        for (var j = 0, lenj = values.length; j < lenj; j++) {
          found |= values[j] === options[i].value;
        }
        options[i].selected = (found === 1);
      }
      if (name === "select") {
        return value;
      }
      return Array.isArray(value) ? value: [value];
    default:
      return element.value = value;
  }
}

/**
 * Checks if an element has a class.
 *
 * @param  Object  element A DOM element.
 * @param  String  name    A class name.
 * @return Boolean         Returns `true` if the element has the `name` class, `false` otherwise.
 */
function hasClass(element, name) {
  return element.classList.contains(name);
}

/**
 * Adds a class to an element.
 *
 * @param  Object  element A DOM element.
 * @param  String  name    The class to add.
 */
function addClass(element, name) {
  element.classList.add(name);
}

/**
 * Removes a class from an element.
 *
 * @param  Object  element A DOM element.
 * @param  String  name    The class to remove.
 */
function removeClass(element, name) {
  element.classList.remove(name);
}

/**
 * Toggles a class.
 *
 * @param  Object  element A DOM element.
 * @param  String  name    The class to toggle.
 */
function toggleClass(element, name) {
  var fn = hasClass(element, name) ? removeClass : addClass;
  fn(element, name);
}

module.exports = {
  attr: attr,
  attrNS: attrNS,
  prop: prop,
  css: css,
  type: type,
  data: data,
  text: text,
  value: value,
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass
};

},{"to-camel-case":10}],10:[function(require,module,exports){

var toSpace = require('to-space-case');


/**
 * Expose `toCamelCase`.
 */

module.exports = toCamelCase;


/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */


function toCamelCase (string) {
  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase();
  });
}
},{"to-space-case":11}],11:[function(require,module,exports){

var clean = require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
},{"to-no-case":12}],12:[function(require,module,exports){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
},{}],13:[function(require,module,exports){
function query(selector, element) {
  return query.one(selector, element);
}

var one = function(selector, element) {
  return element.querySelector(selector);
}

var all = function(selector, element) {
  return element.querySelectorAll(selector);
}

query.one = function(selector, element) {
  if (!selector) {
    return;
  }
  if (typeof selector === "string") {
    element = element || document;
    return one(selector, element);
  }
  if (selector.length !== undefined) {
    return selector[0];
  }
  return selector;
}

query.all = function(selector, element){
  if (!selector) {
    return [];
  }
  var list;
  if (typeof selector !== "string") {
    if (selector.length === undefined) {
      return [selector];
    }
    list = selector;
  } else {
    element = element || document;
    list = all(selector, element);
  }
  return Array.prototype.slice.call(list);
};

query.engine = function(engine){
  if (!engine.one) {
    throw new Error('.one callback required');
  }
  if (!engine.all) {
    throw new Error('.all callback required');
  }
  one = engine.one;
  all = engine.all;
  return query;
};

module.exports = query;

},{}],14:[function(require,module,exports){

/**
 * Expose `isEmpty`.
 */

module.exports = isEmpty;


/**
 * Has.
 */

var has = Object.prototype.hasOwnProperty;


/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty (val) {
  if (null == val) return true;
  if ('number' == typeof val) return 0 === val;
  if (undefined !== val.length) return 0 === val.length;
  for (var key in val) if (has.call(val, key)) return false;
  return true;
}
},{}],15:[function(require,module,exports){
var isArray = Array.isArray;

function create(container, nodes, parent) {
  if (typeof nodes === "function") {
    nodes = nodes(container, parent);
  }
  if (nodes == null) {
    return;
  }
  if (!isArray(nodes)) {
    nodes = [nodes];
  }
  for (var i = 0, len = nodes.length; i < len; i++) {
    if (nodes[i]) {
      container.appendChild(nodes[i].render(parent));
    }
  }
  return nodes;
}

module.exports = create;
},{}],16:[function(require,module,exports){
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
function patch(container, fromChildren, toChildren, parent) {
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

  // Reorder & Add missing nodes
  for (var i = 0, len = toChildren.length; i < len; i++) {
    toItem = toChildren[toIndex];
    if (toItem.key !== undefined) {
      if (fromKeys[toItem.key] !== undefined) {
        domCollection.moveAt(fromKeys[toItem.key], targetIndex, container);
      } else {
        domCollection.insertAt(toItem.render(parent), Math.max(targetIndex, 0), container);
        targetIndex += unshift;
      }
    } else if (freeLength > 0) {
      domCollection.moveAt(fromFree[freeIndex], targetIndex, container);
      freeLength--;
      freeIndex += direction;
    } else {
      domCollection.insertAt(toItem.render(parent), Math.max(targetIndex, 0), container);
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
  var element = from.element;

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
      keys[fromItem.key] = fromItem.element;
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
    free[i] = patch.node(free[i], toChildren[toFree[i]]);
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

},{"dom-collection":8,"is-empty":14}],17:[function(require,module,exports){

function remove(nodes, parent) {
  for (var i = 0, len = nodes.length; i < len; i++) {
    nodes[i].remove();
  }
}

module.exports = remove;
},{}],18:[function(require,module,exports){
var query = require("dom-query");
var create = require("./create");
var update = require("./update");
var remove = require("./remove");
var isArray = Array.isArray;

function Tree() {
  this._mountedIndex = 0;
  this._mounted = Object.create(null);
}

/**
 * Mounts a virtual tree into a passed selector.
 *
 * @param String|Object   selector A CSS string selector or a DOMElement identifying the mounting point(s).
 * @param Function|Object factory  A factory function which returns a virtual tree or the virtual tree itself.
 * @param Object          data     Some extra data to attach to the mount.
 */
Tree.prototype.mount = function(selector, factory, data) {
  data = data || {};
  this.unmount(selector);
  var containers = query.all(selector);
  if (!containers.length) {
    return;
  }
  if (containers.length > 1) {
    return containers.map(function(container) {
      return this.mount(container, mount);
    });
  }
  var container = containers[0];
  this._mountedIndex++;
  var mountId = "" + this._mountedIndex;

  data.container = container;
  data.factory = factory;
  data.children = create(container, factory, null);
  this._mounted[mountId] = data;
  return container.domLayerTreeId = mountId;
}

/**
 * Unmounts a virtual tree.
 *
 * @param String|Object selector A CSS string selector or a DOMElement identifying the mounting point(s).
 */
Tree.prototype.unmount = function(selector) {
  var containers = query.all(selector);
  if (!containers.length) {
    return;
  }
  if (containers.length > 1) {
    for(var i = 0, len = containers.length; i < len; i++) {
      this.unmount(containers[i]);
    }
    return;
  }
  var container = containers[0];
  var mountId = container.domLayerTreeId;
  if (!this._mounted[mountId]) {
    return;
  }

  remove(this._mounted[mountId].children);
  delete this._mounted[mountId];
  delete container.domLayerTreeId;
}

/**
 * Updates a mount (ie. run the factory function and updates the DOM according to occured changes).
 *
 * @param String mountId An optionnal mount identifier or none to update all mounted virtual trees.
 */
Tree.prototype.update = function(mountId) {
  if (arguments.length) {
    var mount = this._mounted[mountId];
    if (mount) {
      mount.children = update(mount.container, mount.children, mount.factory, null);
    }
    return;
  }
  for (mountId in this._mounted) {
    this.update(mountId);
  }
}

/**
 * Returns the definition of a mounted tree all of them if no `mountId` is provided.
 *
 * @param  String mountId A mount identifier or none to get all mounts.
 * @return Object         A mount definition or all of them indexed by their id.
 */
Tree.prototype.mounted = function(mountId) {
  if (arguments.length) {
    return this._mounted[mountId];
  }
  return this._mounted;
}

module.exports = Tree;

},{"./create":15,"./remove":17,"./update":19,"dom-query":13}],19:[function(require,module,exports){
var patch = require("./patch");

var isArray = Array.isArray;

function update(container, fromNodes, toNodes, parent) {
  if (typeof toNodes === "function") {
    toNodes = toNodes(container, parent);
  }
  if (toNodes == null) {
    return;
  }
  if (!isArray(toNodes)) {
    toNodes = [toNodes];
  }
  return patch(container, fromNodes, toNodes, parent);
}

module.exports = update;

},{"./patch":16}],20:[function(require,module,exports){
var Tree = require("./tree/tree");
var create = require("./tree/create");
var update = require("./tree/update");
var remove = require("./tree/remove");
var patch = require("./tree/patch");
var Tag = require("./node/tag");
var Text = require("./node/text");

module.exports = {
  Tree: Tree,
  Tag: Tag,
  Text: Text,
  create: create,
  update: update,
  remove: remove,
  patch: patch
};

},{"./node/tag":6,"./node/text":7,"./tree/create":15,"./tree/patch":16,"./tree/remove":17,"./tree/tree":18,"./tree/update":19}]},{},[20])(20)
});