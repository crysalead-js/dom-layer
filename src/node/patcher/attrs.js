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
    if (attrs[name] != null) {
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
  element[name] = attrs[name] ? attrs[name] : '';
};

/**
 * Custom unset handler for the style attribute.
 */
unset.handlers.value = function(name, element, previous) {
  element.removeAttribute(name);
  element[name] = '';
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
