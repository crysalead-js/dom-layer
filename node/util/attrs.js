var domElementValue = require("dom-element-value");
var valueEqual = require("./value-equal");
var style = require("./style");

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
    if (!previous[name] || attrs[name] != null) {
      continue;
    }
    unset(name, element, previous);
  }
  for (name in attrs) {
    set(name, element, previous, attrs);
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
  if (attrs[name] == null) {
    return;
  }
  if (set.handlers[name]) {
    set.handlers[name](name, element, previous, attrs);
  } else if (previous[name] !== attrs[name]) {
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
 * Custom set handler for the value attribute.
 */
set.handlers.value = function(name, element, previous, attrs) {
  if (valueEqual(domElementValue(element), attrs[name])) {
    return;
  }
  if (element.tagName === "SELECT") {
    if (previous["multiple"] !== attrs["multiple"]) {
     element.setAttribute("multiple", attrs["multiple"]);
    }
  } else {
    element.setAttribute(name, attrs[name]);
  }
  var type = domElementValue.type(element);
  if (type !== "radio" && type !== "checkbox") {
    domElementValue(element, attrs[name]);
  }
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

module.exports = {
  patch: patch,
  set: set,
  unset: unset
};
