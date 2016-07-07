(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.domLayer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Tree = require('./src/tree/tree');
var attach = require('./src/tree/attach');
var render = require('./src/tree/render');
var update = require('./src/tree/update');
var remove = require('./src/tree/remove');
var patch = require('./src/tree/patch');
var Tag = require('./src/node/tag');
var Text = require('./src/node/text');
var attrs = require('./src/node/patcher/attrs');
var attrsNS = require('./src/node/patcher/attrs-n-s');
var props = require('./src/node/patcher/props');
var events = require('./src/events');

module.exports = {
  Tree: Tree,
  Tag: Tag,
  Text: Text,
  attach: attach,
  render: render,
  update: update,
  remove: remove,
  patch: patch,
  attrs: attrs,
  attrsNS: attrsNS,
  props: props,
  events: events
};

},{"./src/events":13,"./src/node/patcher/attrs":15,"./src/node/patcher/attrs-n-s":14,"./src/node/patcher/props":17,"./src/node/tag":20,"./src/node/text":21,"./src/tree/attach":22,"./src/tree/patch":23,"./src/tree/remove":24,"./src/tree/render":25,"./src/tree/tree":26,"./src/tree/update":27}],2:[function(require,module,exports){
var toCamelCase = require('to-camel-case');

/**
 * Gets/Sets a DOM element property.
 *
 * @param  Object        element A DOM element.
 * @param  String|Object name    The name of a property or an object of values to set.
 * @param  String        value   The value of the property to set, or none to get the current
 *                               property value.
 * @return String                The current/new property value.
 */
function css(element, name, value) {
  if (typeof name === 'object') {
    var style = name;
    for (name in style) {
      css(element, name, style[name]);
    }
    return style;
  }
  var attribute = toCamelCase((name === 'float') ? 'cssFloat' : name);
  if (arguments.length === 3) {
    element.style[name] = value || "";
    return value;
  }
  return element.style[name];
}

module.exports = css;

},{"to-camel-case":9}],3:[function(require,module,exports){
/**
 * DOM element value Getter/Setter.
 */

/**
 * Gets/sets DOM element value.
 *
 * @param  Object element A DOM element
 * @param  Object val     The value to set or none to get the current value.
 * @return mixed          The new/current DOM element value.
 */
function value(element, val) {
  if (arguments.length === 1) {
    return get(element);
  }
  return set(element, val);
}

/**
 * Returns the type of a DOM element.
 *
 * @param  Object element A DOM element.
 * @return String         The DOM element type.
 */
value.type = function(element) {
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
 * Gets DOM element value.
 *
 * @param  Object element A DOM element
 * @return mixed          The DOM element value
 */
function get(element) {
  var name = value.type(element);
  switch (name) {
    case "checkbox":
    case "radio":
      if (!element.checked) {
        return false;
      }
      var val = element.getAttribute('value');
      return val == null ? true : val;
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
 * @param  Object val     The value to set.
 * @return mixed          The new DOM element value.
 */
function set(element, val) {
  var name = value.type(element);
  switch (name) {
    case "checkbox":
    case "radio":
      return element.checked = val ? true : false;
    case "select":
    case "select-multiple":
      var found;
      var options = element.options;
      var values = Array.isArray(val) ? val : [val];
      for (var i = 0, leni = options.length; i < leni; i++) {
        found = 0;
        for (var j = 0, lenj = values.length; j < lenj; j++) {
          found |= values[j] === options[i].value;
        }
        options[i].selected = (found === 1);
      }
      if (name === "select") {
        return val;
      }
      return Array.isArray(val) ? val: [val];
    default:
      return element.value = val;
  }
}

module.exports = value;

},{}],4:[function(require,module,exports){
var bind, unbind, prefix = '';

if (typeof window !== "undefined") {
    bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';
} else {
    bind = unbind = function() {};
}

var event = {};

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

event.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

event.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};

module.exports = event;

},{}],5:[function(require,module,exports){
var event = require("./event");

var isArray = Array.isArray;

var capturable = {
  'blur': true,
  'focus': true,
  'mouseenter': true,
  'mouseleave': true
};

/**
 * Captures all event on at a top level container (`document.body` by default).
 * When an event occurs, the delegate handler is executed starting form `event.target` up
 * to the defined container.
 *
 * @param Function delegateHandler The event handler function to execute on triggered events.
 * @param Object   container       A DOM element container.
 */
function EventManager(delegateHandler, container) {
  if (typeof(delegateHandler) !== "function") {
    throw new Error("The passed handler function is invalid");
  }
  this._delegateHandler = delegateHandler;
  this._container = container || document;
  this._events = Object.create(null);
}

/**
 * Binds a event.
 *
 * @param String name The event name to catch.
 */
EventManager.prototype.bind = function(name) {

  var bubbleEvent = function(e) {
    e.isPropagationStopped = false;
    e.delegateTarget = e.target;
    e.stopPropagation = function() {
      this.isPropagationStopped = true;
    }
    while(e.delegateTarget !== null && e.delegateTarget !== this._container.parentNode) {
      this._delegateHandler(name, e);
      if (e.isPropagationStopped) {
        break;
      }
      e.delegateTarget = e.delegateTarget.parentNode;
    }
  }.bind(this);

  if (this._events[name]) {
    this.unbind(name);
  }
  this._events[name] = bubbleEvent;
  event.bind(this._container, name, bubbleEvent, capturable[name] !== undefined);
};

/**
 * Unbinds an event or all events if `name` is not provided.
 *
 * @param String name The event name to uncatch or none to unbind all events.
 */
EventManager.prototype.unbind = function(name) {
  if (arguments.length) {
    if (this._events[name]) {
      event.unbind(this._container, name, this._events[name], capturable[name] !== undefined);
    }
    return;
  }
  for (var key in this._events) {
    this.unbind(key);
  }
};

/**
 * Returns all binded events.
 *
 * @return Array All binded events.
 */
EventManager.prototype.binded = function() {
  return Object.keys(this._events);
}

/**
 * Binds some default events.
 */
EventManager.prototype.bindDefaultEvents = function() {
  for (var i = 0, len = EventManager.events.length; i < len; i++) {
    this.bind(EventManager.events[i]);
  }
};

/**
 * List of events.
 */
EventManager.events = [
  'abort',
  'animationstart',
  'animationiteration',
  'animationend',
  'blur',
  'canplay',
  'canplaythrough',
  'change',
  'click',
  'contextmenu',
  'copy',
  'cut',
  'dblclick',
  'drag',
  'dragend',
  'dragenter',
  'dragexit',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  'durationchange',
  'emptied',
  'encrypted',
  'ended',
  'error',
  'focus',
  'input',
  'invalid',
  'keydown',
  'keypress',
  'keyup',
  'load',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'paste',
  'ratechange',
  'reset',
  'scroll',
  'seeked',
  'seeking',
  'submit',
  'stalled',
  'suspend',
  'timeupdate',
  'transitionend',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'volumechange',
  'waiting',
  'wheel'
];

module.exports = EventManager;

},{"./event":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

},{}],8:[function(require,module,exports){

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
  if ('boolean' == typeof val) return false;
  if ('number' == typeof val) return 0 === val;
  if (undefined !== val.length) return 0 === val.length;
  for (var key in val) if (has.call(val, key)) return false;
  return true;
}

},{}],9:[function(require,module,exports){

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
},{"to-space-case":11}],10:[function(require,module,exports){

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
},{}],11:[function(require,module,exports){

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
},{"to-no-case":10}],12:[function(require,module,exports){
/**
 * This file automatically generated from `pre-publish.js`.
 * Do not manually edit.
 */

module.exports = {
  "area": true,
  "base": true,
  "br": true,
  "col": true,
  "embed": true,
  "hr": true,
  "img": true,
  "input": true,
  "keygen": true,
  "link": true,
  "menuitem": true,
  "meta": true,
  "param": true,
  "source": true,
  "track": true,
  "wbr": true
};

},{}],13:[function(require,module,exports){
var domElementValue = require('dom-element-value');
var EventManager = require('dom-event-manager');

var eventManager;

function eventHandler(name, e) {
  var element = e.delegateTarget;
  if (!element.domLayerNode || !element.domLayerNode.events) {
    return;
  }

  var events = []
  var mouseClickEventName;
  var bail = false;

  if (name.substr(name.length - 5) === 'click') {
    mouseClickEventName = 'onmouse' + name;
    if (element.domLayerNode.events[mouseClickEventName]) {
      events.push(mouseClickEventName);
    }
    // Do not call the `click` handler if it's not a left click.
    if (e.button !== 0) {
      bail = true;
    }
  }

  var eventName;
  if (!bail) {
    eventName = 'on' + name;
    if (element.domLayerNode.events[eventName]) {
      events.push(eventName);
    }
  }

  if (!events.length) {
    return;
  }

  var value;
  if (/^(?:input|select|textarea|button)$/i.test(element.tagName)) {
    value = domElementValue(element);
  }

  for (var i = 0, len = events.length; i < len ; i++) {
    element.domLayerNode.events[events[i]](e, value, element.domLayerNode);
  }
}

function getManager() {
  if (eventManager) {
    return eventManager;
  }
  return eventManager = new EventManager(eventHandler);
}

function init() {
  var em = getManager();
  em.bindDefaultEvents();
  return em;
}

module.exports = {
  EventManager: EventManager,
  getManager: getManager,
  init: init
};

},{"dom-element-value":3,"dom-event-manager":5}],14:[function(require,module,exports){
/**
 * SVG namespaces.
 */
var namespaces = {
  xlink: 'http://www.w3.org/1999/xlink',
  xml: 'http://www.w3.org/XML/1998/namespace',
  xmlns: 'http://www.w3.org/2000/xmlns/'
};

/**
 * Maintains state of element namespaced attributes.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of attributes.
 * @param  Object attrs     The attributes to match on.
 * @return Object attrs     The element attributes state.
 */
function patch(element, previous, attrs) {
  if (!previous && !attrs) {
    return attrs;
  }
  var attrName, ns, name, value, split;
  previous = previous || {};
  attrs = attrs || {};

  for (attrName in previous) {
    if (previous[attrName] && !attrs[attrName]) {
      split = splitAttrName(attrName);
      ns = namespaces[split[0]];
      name = split[1];
      element.removeAttributeNS(ns, name);
    }
  }
  for (attrName in attrs) {
    value = attrs[attrName];
    if (previous[attrName] === value) {
      continue;
    }
    if (value) {
      split = splitAttrName(attrName);
      ns = namespaces[split[0]];
      name = split[1];
      element.setAttributeNS(ns, name, value);
    }
  }
  return attrs;
}

function splitAttrName(attrName) {
  return attrName.split(':');
}

module.exports = {
  patch: patch,
  namespaces: namespaces
};

},{}],15:[function(require,module,exports){
var style = require('./style');
var stringifyClass = require('../../util/stringify-class');
var EventManager = require('dom-event-manager');
var events = EventManager.events;

/**
 * Maintains state of element attributes.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of attributes.
 * @param  Object attrs     The attributes to match on.
 * @return Object attrs     The element attributes state.
 */
function patch(element, previous, attrs) {
  if (!previous && !attrs) {
    return attrs;
  }
  var name, value;
  previous = previous || {};
  attrs = attrs || {};

  for (name in previous) {
    if (previous[name] && !attrs[name]) {
      unset(name, element, previous);
    }
  }
  for (name in attrs) {
    if (previous[name] === attrs[name]) {
      continue;
    }
    if (attrs[name]) {
      set(name, element, previous, attrs);
    }
  }
  return attrs;
}

/**
 * Sets an attribute.
 *
 * @param  String name      The attribute name to set.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of attributes.
 * @param  Object attrs     The attributes to match on.
 */
function set(name, element, previous, attrs) {
  if (set.handlers[name]) {
    set.handlers[name](name, element, previous, attrs);
  } else if (attrs[name] != null && previous[name] !== attrs[name]) {
    element.setAttribute(name, attrs[name]);
  }
};
set.handlers = Object.create(null);

/**
 * Unsets an attribute.
 *
 * @param  String name      The attribute name to unset.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of attributes.
 */
function unset(name, element, previous) {
  if (unset.handlers[name]) {
    unset.handlers[name](name, element, previous);
  } else {
    element.removeAttribute(name);
  }
};
unset.handlers = Object.create(null);

/**
 * Custom set handler for the type attribute.
 * When changed the value is restored (IE compatibility).
 */
set.handlers.type = function(name, element, previous, attrs) {
  if (previous[name] === attrs[name]) {
    return;
  }
  var value = element.getAttribute('value');
  element.setAttribute(name, attrs[name]);
  element.setAttribute('value', value);
  element.value = value;
};

/**
 * Custom set handler for the value attribute.
 */
set.handlers.value = function(name, element, previous, attrs) {
  if (previous[name] === attrs[name]) {
    return;
  }
  element.setAttribute(name, attrs[name]);
  element[name] = attrs[name] ? attrs[name] : '';
};

/**
 * Custom set handler for the class attribute.
 */
set.handlers['class'] = function(name, element, previous, attrs) {
  if (attrs[name] == null) {
    return;
  }
  element.setAttribute(name, stringifyClass(attrs[name])); // Should work for IE > 7
};

/**
 * Custom set handler for the style attribute.
 */
set.handlers.style = function(name, element, previous, attrs) {
  style.patch(element, previous[name], attrs[name]);
};

/**
 * Custom unset handler for the style attribute.
 */
unset.handlers.style = function(name, element, previous) {
  style.patch(element, previous[name]);
};

/**
 * Custom handlers for event attributes.
 * When the event definition is a string, set it as an attribute.
 * When the event definition is a function, set it as a property.
 */
for (var i = 0, len = events.length; i < len; i++) {
  var name = 'on' + events[i];
  set.handlers[name] = function(name, element, previous, attrs) {
    if (typeof attrs[name] === 'function') {
      if (typeof previous[name] !== 'function') {
        element.removeAttribute(name);
      }
      element[name] = attrs[name];
    } else if (attrs[name] != null && previous[name] !== attrs[name]) {
      element.setAttribute(name, attrs[name]);
    }
  };
  unset.handlers[name] = function(name, element, previous, attrs) {
    if (typeof previous[name] === 'function') {
      element[name] = null;
    } else {
      element.removeAttribute(name);
    }
  };
}

module.exports = {
  patch: patch,
  set: set,
  unset: unset
};

},{"../../util/stringify-class":29,"./style":19,"dom-event-manager":5}],16:[function(require,module,exports){
/**
 * Maintains state of element dataset.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of dataset.
 * @param  Object dataset   The dataset to match on.
 * @return Object dataset   The element dataset state.
 */
function patch(element, previous, dataset) {
  if (!previous && !dataset) {
    return dataset;
  }
  var name;
  previous = previous || {};
  dataset = dataset || {};

  for (name in previous) {
    if (dataset[name] === undefined) {
      delete element.dataset[name];
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

module.exports = {
  patch: patch
};

},{}],17:[function(require,module,exports){
var dataset = require('./dataset');
var stringifyClass = require('../../util/stringify-class');

/**
 * Maintains state of element properties.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of properties.
 * @param  Object props     The properties to match on.
 * @return Object props     The element properties state.
 */
function patch(element, previous, props) {
  if (!previous && !props) {
    return props;
  }
  var name, value;
  previous = previous || {};
  props = props || {};

  for (name in previous) {
    if (previous[name] === undefined || props[name] !== undefined) {
      continue;
    }
    unset(name, element, previous);
  }
  for (name in props) {
    set(name, element, previous, props);
  }
  return props;
}

/**
 * Sets a property.
 *
 * @param  String name      The property name to set.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of properties.
 * @param  Object props     The properties to match on.
 */
function set(name, element, previous, props) {
  if (set.handlers[name]) {
    set.handlers[name](name, element, previous, props);
  } else if (previous[name] !== props[name]) {
    element[name] = props[name];
  }
};
set.handlers = Object.create(null);

/**
 * Unsets a property.
 *
 * @param  String name      The property name to unset.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of properties.
 */
function unset(name, element, previous) {
  if (unset.handlers[name]) {
    unset.handlers[name](name, element, previous);
  } else {
    element[name] = null;
  }
};
unset.handlers = Object.create(null);

/**
 * Custom set handler for the type attribute.
 * When changed the value is restored (IE compatibility).
 */
set.handlers.type = function(name, element, previous, props) {
  if (previous[name] === props[name]) {
    return;
  }
  var value = element.value;
  element[name] = props[name];
  element.value = value;
};

/**
 * Custom set handler for the class attribute.
 */
set.handlers.className = function(name, element, previous, props) {
  element.className = props[name] ? stringifyClass(props[name]) : '';
};

/**
 * Custom set handler for the dataset attribute.
 */
set.handlers.dataset = function(name, element, previous, props) {
  dataset.patch(element, previous[name], props[name]);
};

/**
 * Custom unset handler for the class attribute.
 */
unset.handlers.className = function(name, element, previous) {
  element.className = '';
};

/**
 * Custom unset handler for the dataset attribute.
 */
unset.handlers.dataset = function(name, element, previous) {
  dataset.patch(element, previous[name], {});
};

module.exports = {
  patch: patch,
  set: set,
  unset: unset
};

},{"../../util/stringify-class":29,"./dataset":16}],18:[function(require,module,exports){
var isArray = Array.isArray;

/**
 * This is a convenience function which preprocesses the value attribute/property
 * set on a select or select multiple virtual node. The value is first populated over
 * corresponding `<option>` by setting the `'selected'` attribute and then deleted
 * from the node `attrs` & `props` field.
 */
function selectValue(node) {
  if (node.tagName !== 'select') {
    return;
  }
  var value = node.attrs && node.attrs.value;
  value = value || node.props && node.props.value;

  if (value == null) {
    return;
  }

  var values = {};
  if (!isArray(value)) {
    values[value] = value;
  } else {
    for (var i = 0, len = value.length; i < len ; i++) {
      values[value[i]] = value[i];
    }
  }
  populateOptions(node, values);
  if (node.attrs && node.attrs.hasOwnProperty('value')) {
    delete node.attrs.value;
  }
  if (node.props && node.props.hasOwnProperty('value')) {
    delete node.props.value;
  }
}

/**
 * Populates values to options node.
 *
 * @param  Object node      A starting node (generaly a select node).
 * @param  Object values    The selected values to populate.
 */
function populateOptions(node, values) {
  if (node.tagName !== 'option') {
    for (var i = 0, len = node.children.length; i < len ; i++) {
      populateOptions(node.children[i], values);
    }
    return;
  }
  var value = node.attrs && node.attrs.value;
  value = value || node.props && node.props.value;

  if (!values.hasOwnProperty(value)) {
    return;
  }
  node.attrs = node.attrs || {};
  node.attrs.selected = 'selected';
  node.props = node.props || {};
  node.props.selected = true;
}

module.exports = selectValue;

},{}],19:[function(require,module,exports){
var domElementCss = require('dom-element-css');

/**
 * Maintains state of element style attribute.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of style attributes.
 * @param  Object style     The style attributes to match on.
 */
function patch(element, previous, style) {
  if (!previous && !style) {
    return style;
  }
  var rule;
  if (typeof style === 'object') {
    if (typeof previous === 'object') {
      for (rule in previous) {
        if (!style[rule]) {
          domElementCss(element, rule, null);
        }
      }
      domElementCss(element, style);
    } else {
      if (previous) {
        element.setAttribute('style', '');
      }
      domElementCss(element, style);
    }
  } else {
    element.setAttribute('style', style || '');
  }
}

module.exports = {
  patch: patch
};

},{"dom-element-css":2}],20:[function(require,module,exports){
var voidElements = require('void-elements');
var attach = require('../tree/attach');
var render = require('../tree/render');
var update = require('../tree/update');
var props = require('./patcher/props');
var attrs = require('./patcher/attrs');
var attrsNS = require('./patcher/attrs-n-s');
var selectValue = require('./patcher/select-value');
var stringifyAttrs = require('../util/stringify-attrs');
var Text = require('./text');

/**
 * The Virtual Tag constructor.
 *
 * @param  String tagName  The tag name.
 * @param  Object config   The virtual node definition.
 * @param  Array  children An array for children.
 */
function Tag(tagName, config, children) {
  this.tagName = tagName || 'div';
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

Tag.prototype.type = 'Tag';

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
    if (this.tagName === 'svg' ) {
      this.namespace = 'http://www.w3.org/2000/svg';
    } else if (this.tagName === 'math') {
      this.namespace = 'http://www.w3.org/1998/Math/MathML';
    } else if (parent) {
      this.namespace = parent.namespace;
    }
  }

  var element = this.element = this.create();

  if (this.events || this.data) {
    element.domLayerNode = this;
  }

  if (this.tagName === 'select') {
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
    return to.render(this.element.parentNode, to.parent);
  }
  to.element = this.element;
  to.parent = this.parent;

  if (this.tagName === 'select') {
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
 * Broadcasts the remove 'event'.
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
  var html = '<' + this.tagName + (attrs ? ' ' + attrs : '') + (attrsNS ? ' ' + attrsNS : '') + '>';

  var len = children.length;

  if (this.props && this.props.innerHTML && len === 0) {
    html += this.props.innerHTML;
  } else {
    for (var i = 0; i < len ; i++) {
      if (children[i]) {
        html += children[i].toHtml();
      }
    }
  }
  html += voidElements[this.tagName] ? '' : '</' + this.tagName + '>';
  return html;

};

module.exports = Tag;

},{"../tree/attach":22,"../tree/render":25,"../tree/update":27,"../util/stringify-attrs":28,"./patcher/attrs":15,"./patcher/attrs-n-s":14,"./patcher/props":17,"./patcher/select-value":18,"./text":21,"void-elements":12}],21:[function(require,module,exports){
var escapeHtml = require('escape-html');

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

Text.prototype.type = 'Text';

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
    return to.render(this.element.parentNode, to.parent);
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
},{"escape-html":7}],22:[function(require,module,exports){
var isArray = Array.isArray;

function attach(container, nodes, parent) {
  if (typeof nodes === 'function') {
    nodes = nodes(container, parent);
  }
  if (!isArray(nodes)) {
    nodes = [nodes];
  }

  var i = 0, j = 0;
  var childNodes = container.childNodes;
  var nodesLen = nodes.length
  var text, textLen, size;

  while (i < nodesLen) {
    if (!nodes[i]) {
      i++;
      continue;
    }
    if (nodes[i].type !== 'Text') {
      nodes[i].attach(childNodes[j], parent);
      i++;
    } else {
      // In an HTML template having consecutive textual nodes is not possible.
      // So the virtual tree will be dynamically adjusted to make attachments to
      // work out of the box in a transparent manner if this principle is not
      // respected in a virtual tree.

      size = nodes[i].data.length;
      text = childNodes[j].data;

      nodes[i].data = text;
      nodes[i].attach(childNodes[j], parent);
      i++;

      textLen = text.length;
      while (size < textLen && i < nodesLen) {
        size += nodes[i].data.length;
        nodes[i].data = '';
        i++;
      }
    }
    j++;
  }
  return nodes;
}

module.exports = attach;

},{}],23:[function(require,module,exports){
var isEmpty = require('is-empty');

var isArray = Array.isArray;

/**
 * Patches & Reorders child nodes of a container (i.e represented by `fromChildren`) to match `toChildren`.
 *
 * Since finding the longest common subsequence problem is NP-hard, this implementation
 * is a simple heuristic for reordering nodes with a 'minimum' of moves in O(n).
 *
 * @param Object container    The parent container.
 * @param Array  children     The current array of children.
 * @param Array  toChildren   The new array of children to reach.
 * @param Object parent       The parent virtual node.
 */
function patch(container, children, toChildren, parent) {
  var fromChildren = children.slice();
  var fromStartIndex = 0, toStartIndex = 0;
  var fromEndIndex = fromChildren.length - 1;
  var fromStartNode = fromChildren[0];
  var fromEndNode = fromChildren[fromEndIndex];
  var toEndIndex = toChildren.length - 1;
  var toStartNode = toChildren[0];
  var toEndNode = toChildren[toEndIndex];

  var indexes, index, node, before;

  while (fromStartIndex <= fromEndIndex && toStartIndex <= toEndIndex) {
    if (fromStartNode == undefined) {
      fromStartNode = fromChildren[++fromStartIndex];
    } else if (fromEndNode == undefined) {
      fromEndNode = fromChildren[--fromEndIndex];
    } else if (toStartNode == undefined) {
      toStartNode = toChildren[++toStartIndex];
    } else if (toEndNode == undefined) {
      toEndNode = toChildren[--toEndIndex];
    } else if (fromStartNode.match(toStartNode)) {
      fromStartNode.patch(toStartNode);
      fromStartNode = fromChildren[++fromStartIndex];
      toStartNode = toChildren[++toStartIndex];
    } else if (fromEndNode.match(toEndNode)) {
      fromEndNode.patch(toEndNode);
      fromEndNode = fromChildren[--fromEndIndex];
      toEndNode = toChildren[--toEndIndex];
    } else if (fromStartNode.match(toEndNode)) {
      fromStartNode.patch(toEndNode);
      container.insertBefore(fromStartNode.element, fromEndNode.element.nextSibling);
      fromStartNode = fromChildren[++fromStartIndex];
      toEndNode = toChildren[--toEndIndex];
    } else if (fromEndNode.match(toStartNode)) {
      fromEndNode.patch(toStartNode);
      container.insertBefore(fromEndNode.element, fromStartNode.element);
      fromEndNode = fromChildren[--fromEndIndex];
      toStartNode = toChildren[++toStartIndex];
    } else {
      if (indexes === undefined) {
        indexes = keysIndexes(fromChildren, fromStartIndex, fromEndIndex);
      }
      index = indexes[toStartNode.key];
      if (index === undefined) {
        container.insertBefore(toStartNode.render(container, parent), fromStartNode.element);
        toStartNode = toChildren[++toStartIndex];
      } else {
        node = fromChildren[index];
        node.patch(toStartNode);
        fromChildren[index] = undefined;
        container.insertBefore(node.element, fromStartNode.element);
        toStartNode = toChildren[++toStartIndex];
      }
    }
  }
  if (fromStartIndex > fromEndIndex) {
    before = toChildren[toEndIndex + 1] == undefined ? null : toChildren[toEndIndex + 1].element;
    for (; toStartIndex <= toEndIndex; toStartIndex++) {
      if (toChildren[toStartIndex] != undefined) {
        container.insertBefore(toChildren[toStartIndex].render(container, parent), before);
      }
    }
  } else if (toStartIndex > toEndIndex) {
    for (; fromStartIndex <= fromEndIndex; fromStartIndex++) {
      if (fromChildren[fromStartIndex] != undefined) {
        fromChildren[fromStartIndex].remove();
      }
    }
  }
  return toChildren;
}

/**
 * Returns indexes of keyed nodes.
 *
 * @param  Array  children An array of nodes.
 * @return Object          An object of keyed nodes indexes.
 */
function keysIndexes(children, startIndex, endIndex) {
  var i, keys = Object.create(null), key;
  for (i = startIndex; i <= endIndex; ++i) {
    key = children[i].key;
    if (key !== undefined) {
      keys[key] = i;
    }
  }
  return keys;
}

module.exports = patch;

},{"is-empty":8}],24:[function(require,module,exports){

function remove(nodes, parent) {
  for (var i = 0, len = nodes.length; i < len; i++) {
    nodes[i].remove();
  }
}

module.exports = remove;

},{}],25:[function(require,module,exports){
var isArray = Array.isArray;

function render(container, nodes, parent) {
  if (typeof nodes === 'function') {
    nodes = nodes(container, parent);
  }
  if (!isArray(nodes)) {
    nodes = [nodes];
  }
  for (var i = 0, len = nodes.length; i < len; i++) {
    if (nodes[i]) {
      nodes[i].render(container, parent);
    }
  }
  return nodes;
}

module.exports = render;

},{}],26:[function(require,module,exports){
var query = require('dom-query');
var attach = require('./attach');
var render = require('./render');
var update = require('./update');
var remove = require('./remove');
var isArray = Array.isArray;

function Tree() {
  this._mounted = Object.create(null);
}

/**
 * Mounts a virtual tree into a passed selector.
 *
 * @param String|Object   selector A CSS string selector or a DOMElement identifying the mounting point.
 * @param Function|Object factory  A factory function which returns a virtual tree or the virtual tree itself.
 * @param Object          mount    Some extra data to attach to the mount.
 */
Tree.prototype.mount = function(selector, factory, mount) {
  mount = mount || {};
  var containers = query.all(selector);
  if (containers.length !== 1) {
    throw new Error('The selector must identify an unique DOM element.');
  }

  var container = containers[0];
  if (container.domLayerTreeId) {
    this.unmount(container.domLayerTreeId);
  }

  var mountId = mount.mountId ? mount.mountId : this.uuid();
  var fragment = document.createDocumentFragment();

  mount.factory = factory;
  mount.children = render(fragment, factory, null);
  if (mount.transclude) {
    mount.transcluded = container;
    if (fragment.childNodes.length !== 1) {
      throw new Error('Transclusion requires a single DOMElement to transclude.');
    }
    mount.container = fragment.childNodes[0];
    container.parentNode.replaceChild(mount.container, container);
  } else {
    container.appendChild(fragment);
    mount.container = container;
  }
  this._mounted[mountId] = mount;
  return mount.container.domLayerTreeId = mountId;
};

/**
 * Attaches a virtual tree onto a previously rendered DOM tree.
 *
 * @param String|Object   selector A CSS string selector or a DOMElement identifying the mounting point
 *                                 containing a previously rendered DOM tree.
 * @param Function|Object factory  A factory function which returns a virtual tree or the virtual tree itself.
 * @param Object          mount    Some extra mount to attach to the mount.
 */
Tree.prototype.attach = function(selector, factory, mount) {
  mount = mount || {};
  var containers = query.all(selector);
  if (containers.length !== 1) {
    throw new Error('The selector must identify an unique DOM element.');
  }

  var container = containers[0];
  if (container.domLayerTreeId) {
    this.unmount(container.domLayerTreeId);
  }

  var mountId = mount.mountId ? mount.mountId : this.uuid();
  mount.container = container;
  mount.factory = factory;
  mount.children = attach(container, factory, null);
  this._mounted[mountId] = mount;
  return container.domLayerTreeId = mountId;
};

/**
 * Returns a UUID identifier.
 *
 * @return String a unique identifier
 */
Tree.prototype.uuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
};

/**
 * Unmounts a virtual tree.
 *
 * @param String mountId An optionnal mount identifier or none to update all mounted virtual trees.
 */
Tree.prototype.unmount = function(mountId) {
  if (!arguments.length) {
    this.unmount(Object.keys(this._mounted));
    return;
  }
  var mounted = Array.isArray(mountId) ? mountId : arguments;
  var len = mounted.length;
  for (var i = 0; i < len; i++) {
    var mountId = mounted[i];
    var mount = this._mounted[mountId];
    if (mount) {
      if (mount.transclude) {
        mount.container.parentNode.replaceChild(mount.transcluded, mount.container);
      } else {
        remove(mount.children);
      }
      delete mount.container.domLayerTreeId;
      delete this._mounted[mountId];
    }
  }
};

/**
 * Updates a mount (ie. run the factory function and updates the DOM according to occured changes).
 *
 * @param String mountId An optionnal mount identifier or none to update all mounted virtual trees.
 * @param String tree    An optionnal virtual tree to use.
 */
Tree.prototype.update = function(mountId, tree) {
  if (arguments.length) {
    var mount = this._mounted[mountId];
    if (mount) {
      var active = document.activeElement;
      mount.children = update(mount.container, mount.children, tree ? tree : mount.factory, null);
      if (document.activeElement !== active) {
        active.focus();
      }
    }
    return;
  }
  for (mountId in this._mounted) {
    this.update(mountId);
  }
};

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
};

module.exports = Tree;

},{"./attach":22,"./remove":24,"./render":25,"./update":27,"dom-query":6}],27:[function(require,module,exports){
var patch = require('./patch');

var isArray = Array.isArray;

function update(container, fromNodes, toNodes, parent) {
  if (typeof toNodes === 'function') {
    toNodes = toNodes(container, parent);
  }
  if (!isArray(toNodes)) {
    toNodes = [toNodes];
  }
  return patch(container, fromNodes, toNodes, parent);
}

module.exports = update;

},{"./patch":23}],28:[function(require,module,exports){
var stringifyStyle = require('./stringify-style');
var stringifyClass = require('./stringify-class');

/**
 * Returns a `'key1='value1' key2='value2' ...'` string from
 * a `{ key1: 'value1', key2: 'value2' }` object.
 *
 * @param  Object attrs The keys/values object to stringify.
 * @return String       The corresponding string.
 */
function stringifyAttrs(attrs, tagName) {
  if (!attrs) {
    return '';
  }
  var attributes = [], value;
  for (var key in attrs) {
    value = attrs[key];
    if (key === 'style') {
      value = stringifyStyle(value);
    } else if (key === 'class') {
      value = stringifyClass(value);
    }
    attributes.push(key + '="' + String(value).replace(/"/g, '\\"') + '"');
  }
  return attributes.join(' ');
}

module.exports = stringifyAttrs;

},{"./stringify-class":29,"./stringify-style":30}],29:[function(require,module,exports){
/**
 * Returns a `'class1 class3' ...'` string from
 * a `{ class1: true, class2: false, class3: true }` object.
 *
 * @param  Object className The keys/values object to stringify.
 * @return String           The corresponding string.
 */
function stringifyClass(classAttr) {
  if (typeof classAttr === 'string') {
    return classAttr;
  }
  var classes = [];
  for (var key in classAttr) {
    if (classAttr[key]) {
      classes.push(key);
    }
  }
  return classes.join(' ');
}

module.exports = stringifyClass;

},{}],30:[function(require,module,exports){
/**
 * Returns a `'key1:value1;key2:value2' ...'` string from
 * a `{ key1: 'value1', key2: 'value2' }` object.
 *
 * @param  Object attrs The keys/values object to stringify.
 * @return String       The corresponding string.
 */
function stringifyStyle(style) {
  if (typeof style === 'string') {
    return style;
  }
  var values = [];
  for (var key in style) {
    values.push(key + ':' + style[key]);
  }
  return values.join(';');
}

module.exports = stringifyStyle;

},{}]},{},[1])(1)
});