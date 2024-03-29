(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.domLayer = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
var stringifyClass = require('./src/util/stringify-class');
var stringifyStyle = require('./src/util/stringify-style');

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
  events: events,
  stringifyClass: stringifyClass,
  stringifyStyle: stringifyStyle
};

},{"./src/events":12,"./src/node/patcher/attrs":14,"./src/node/patcher/attrs-n-s":13,"./src/node/patcher/props":16,"./src/node/tag":19,"./src/node/text":20,"./src/tree/attach":21,"./src/tree/patch":22,"./src/tree/remove":23,"./src/tree/render":24,"./src/tree/tree":25,"./src/tree/update":26,"./src/util/stringify-class":28,"./src/util/stringify-style":29}],2:[function(require,module,exports){
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

},{"to-camel-case":8}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
  this._map = {};
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
    while(e.delegateTarget && e.delegateTarget !== this._container.parentNode) {
      if (name !== 'click' || !e.delegateTarget.disabled) {
        this._delegateHandler(name, e);
        this._runHandlers(name, e);
      }
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
 * Listen an event.
 *
 * @param String name    The event name listen.
 * @param Object element The DOM element.
 * @param String handler The handler.
 */
EventManager.prototype.on = function(event, element, handler) {
  if (!this._map[event]) {
    this._map[event] = new Map();
  }
  if (!this._map[event].has(element)) {
    this._map[event].set(element, new Map());
  }
  this._map[event].get(element).set(handler, true);
};


/**
 * Unlisten an event.
 *
 * @param String name    The event name listen.
 * @param Object element The DOM element.
 * @param String handler The handler.
 */
EventManager.prototype.off = function(event, element, handler) {
  if (!this._map[event]) {
    return;
  }
  if (arguments.length === 1) {
    delete this._map[event];
    return;
  }
  if (!this._map[event].has(element)) {
    return;
  }
  if (arguments.length === 2) {
    this._map[event].delete(element);
    return;
  }
  var handlersMap = this._map[event].get(element);
  if (!handlersMap.has(handler)) {
    return;
  }
  handlersMap.delete(handler);
};

/**
 * Unlisten an event.
 *
 * @param String name    The event name listen.
 * @param Object element The DOM element.
 * @param String handler The handler.
 */
EventManager.prototype._runHandlers = function(name, e) {
  if (!this._map[name]) {
    return;
  }
  if (!this._map[name].has(e.delegateTarget)) {
    return;
  }
  this._map[name].get(e.delegateTarget).forEach(function(value, handler) {
    handler(e);
  });
}

/**
 * List of events.
 */
EventManager.events = [
  'abort',
  'animationstart',
  'animationiteration',
  'animationend',
  'auxclick',
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

},{"./event":3}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){

/**
 * Has own property.
 *
 * @type {Function}
 */

var has = Object.prototype.hasOwnProperty

/**
 * To string.
 *
 * @type {Function}
 */

var toString = Object.prototype.toString

/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty(val) {
  // Null and Undefined...
  if (val == null) return true

  // Booleans...
  if ('boolean' == typeof val) return false

  // Numbers...
  if ('number' == typeof val) return val === 0

  // Strings...
  if ('string' == typeof val) return val.length === 0

  // Functions...
  if ('function' == typeof val) return val.length === 0

  // Arrays...
  if (Array.isArray(val)) return val.length === 0

  // Errors...
  if (val instanceof Error) return val.message === ''

  // Objects...
  if (val.toString == toString) {
    switch (val.toString()) {

      // Maps, Sets, Files and Errors...
      case '[object File]':
      case '[object Map]':
      case '[object Set]': {
        return val.size === 0
      }

      // Plain objects...
      case '[object Object]': {
        for (var key in val) {
          if (has.call(val, key)) return false
        }

        return true
      }
    }
  }

  // Anything else...
  return false
}

/**
 * Export `isEmpty`.
 *
 * @type {Function}
 */

module.exports = isEmpty

},{}],8:[function(require,module,exports){

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
},{"to-space-case":10}],9:[function(require,module,exports){

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
},{}],10:[function(require,module,exports){

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
},{"to-no-case":9}],11:[function(require,module,exports){
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
  "link": true,
  "meta": true,
  "param": true,
  "source": true,
  "track": true,
  "wbr": true
};

},{}],12:[function(require,module,exports){
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
    if (e.button !== 0 && name.substr(0, 3) !== 'aux') {
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

  for (var i = 0, len = events.length; i < len ; i++) {
    element.domLayerNode.events[events[i]](e, element.domLayerNode);
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

},{"dom-event-manager":4}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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
    if (attrs[name] != null && attrs[name] !== false) {
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
  if (value !== null) {
    element.setAttribute('value', value);
    element.value = value;
  }
};

/**
 * Custom set handler for the value attribute.
 */
set.handlers.value = function(name, element, previous, attrs) {
  if (previous[name] === attrs[name]) {
    return;
  }
  element.setAttribute(name, attrs[name]);
  element[name] = attrs[name] != null && attrs[name] !== false ? attrs[name] : '';
};

/**
 * Custom unset handler for the value attribute.
 */
unset.handlers.value = function(name, element, previous) {
  element.removeAttribute(name);
  element[name] = '';
};

/**
 * Custom set handler for the checked attribute.
 */
set.handlers.checked = function(name, element, previous, attrs) {
  if (previous[name] === attrs[name]) {
    return;
  }
  element.setAttribute(name, true);
  element[name] = true;
};

/**
 * Custom unset handler for the checked attribute.
 */
unset.handlers.checked = function(name, element, previous) {
  element.removeAttribute(name);
  element[name] = false;
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

},{"../../util/stringify-class":28,"./style":18,"dom-event-manager":4}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"../../util/stringify-class":28,"./dataset":15}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"dom-element-css":2}],19:[function(require,module,exports){
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
  this.params = config.params;
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
      element = document.createElementNS(this.namespace, this.tagName, { is: this.is });
    } else {
      element = document.createElementNS(this.namespace, this.tagName);
    }
  } else {
    if (this.is) {
      element = document.createElement(this.tagName, { is: this.is });
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
Tag.prototype.render = function(container, parent, isFragment) {
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

  if (this.hooks && this.hooks.created) {
    this.hooks.created(this, element);
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

  if (!container) {
    isFragment = true;
    container = document.createDocumentFragment();
  }

  container.appendChild(element);

  render(element, this.children, this, isFragment);

  if (!isFragment && this.hooks && this.hooks.inserted) {
    return this.hooks.inserted(this, element);
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

  if (this.hooks && this.hooks.created) {
    this.hooks.created(this, element);
  }

  props.patch(element, {}, this.props);

  attach(element, this.children, this);

  if (this.hooks && this.hooks.inserted) {
    return this.hooks.inserted(this, element);
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
    return to.render(this.element.parentNode, to.parent);
  }
  to.element = this.element;
  to.parent = this.parent;

  if (this.tagName === 'select') {
    selectValue(to);
  }

  if (to.hooks && to.hooks.update) {
    to.hooks.update(to, this, to.element);
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

  if (to.hooks && to.hooks.updated) {
    to.hooks.updated(to, this, to.element);
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
    for (var i = 0, len = node.children.length; i < len; i++) {
      if (node.children[i]) {
        broadcastRemove(node.children[i]);
      }
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

},{"../tree/attach":21,"../tree/render":24,"../tree/update":26,"../util/stringify-attrs":27,"./patcher/attrs":14,"./patcher/attrs-n-s":13,"./patcher/props":16,"./patcher/select-value":17,"./text":20,"void-elements":11}],20:[function(require,module,exports){
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
},{"escape-html":6}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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
        if (!node.match(toStartNode)) {
          container.insertBefore(toStartNode.render(node.element.parentNode, toStartNode.parent), fromStartNode.element);
        } else {
          node.patch(toStartNode);
          fromChildren[index] = undefined;
          container.insertBefore(node.element, fromStartNode.element);
        }
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
    if (children[i]) {
      key = children[i].key;
      if (key !== undefined) {
        keys[key] = i;
      }
    }
  }
  return keys;
}

module.exports = patch;

},{"is-empty":7}],23:[function(require,module,exports){

function remove(nodes, parent) {
  for (var i = 0, len = nodes.length; i < len; i++) {
    nodes[i].remove();
  }
}

module.exports = remove;

},{}],24:[function(require,module,exports){
var isArray = Array.isArray;

function render(container, nodes, parent, isFragment) {
  if (typeof nodes === 'function') {
    nodes = nodes(container, parent);
  }
  if (!isArray(nodes)) {
    nodes = [nodes];
  }
  for (var i = 0, len = nodes.length; i < len; i++) {
    if (nodes[i]) {
      nodes[i].render(container, parent, isFragment);
    }
  }
  return nodes;
}

module.exports = render;

},{}],25:[function(require,module,exports){
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
 * Broadcasts the inserted 'event'.
 */
function broadcastInserted(node) {
  if (node.hooks && node.hooks.inserted) {
    return node.hooks.inserted(node, node.element);
  }
  if (node.children) {
    for (var i = 0, len = node.children.length; i < len; i++) {
      if (node.children[i]) {
        broadcastInserted(node.children[i]);
      }
    }
  }
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

  var mountId = mount.mountId ? mount.mountId : this.uuid();
  var fragment = document.createDocumentFragment();

  mount.factory = factory;
  mount.children = render(fragment, factory, null, true);
  mount.transclusions = [];
  if (mount.transclude) {
    mount.transcluded = container;
    if (fragment.childNodes.length !== 1) {
      throw new Error('Transclusion requires a single DOMElement to transclude.');
    }
    mount.element = fragment.childNodes[0];
    container.parentNode.replaceChild(mount.element, container);
    if (container.domLayerTreeId) {
      var previousMount = this.mounted(container.domLayerTreeId);
      mount.transclusions = previousMount.transclusions;
      mount.transclusions.push(previousMount);
    }
    for (var i = 0, len = mount.transclusions.length; i < len; i++) {
      mount.transclusions[i].element = mount.element;
      mount.transclusions[i].children[0].element = mount.element;
    }
  } else {
    if (container.domLayerTreeId) {
      this.unmount(container.domLayerTreeId);
    }
    container.appendChild(fragment);
    mount.element = container;
  }
  mount.element.domLayerTreeId = mountId;
  this._mounted[mountId] = mount;
  for (var i = 0, len = mount.children.length; i < len; i++) {
    broadcastInserted(mount.children[i]);
  }
  return mountId;
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
  mount.element = container;
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
      var nodes = mount.children;
      for (var i = 0, len = nodes.length; i < len; i++) {
        nodes[i].remove(false);
      }
      if (mount.transclude) {
        mount.element.parentNode.replaceChild(mount.transcluded, mount.element);
        for (var i = 0, len = mount.transclusions.length; i < len; i++) {
          mount.transclusions[i].element = mount.transcluded;
          mount.transclusions[i].children[0].element = mount.transcluded;
        }
        mount.transclusions.pop();
      }
      for (var i = 0, len = nodes.length; i < len; i++) {
        nodes[i].destroy();
      }
      delete mount.element.domLayerTreeId;
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
      mount.children = update(mount.element, mount.children, tree ? tree : mount.factory, null);
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

},{"./attach":21,"./remove":23,"./render":24,"./update":26,"dom-query":5}],26:[function(require,module,exports){
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

},{"./patch":22}],27:[function(require,module,exports){
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

},{"./stringify-class":28,"./stringify-style":29}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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
