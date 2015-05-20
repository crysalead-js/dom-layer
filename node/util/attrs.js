var domElementValue = require("dom-element-value");
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
    if (!previous[name] || attrs[name]) {
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
  if (set[name]) {
    set[name](name, element, previous, attrs);
  } else if (previous[name] !== attrs[name]) {
    element.setAttribute(name, attrs[name]);
  }
};

/**
 * Unsets an attribute.
 *
 * @param  String name      The attribute name to unset.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of attributes.
 */
function unset(name, element, previous) {
  if (unset[name]) {
    unset[name](name, element, previous);
  } else {
    element.removeAttribute(name);
  }
};

/**
 * Custom set handler for the value attribute.
 */
set.value = function(name, element, previous, attrs) {
  if (previous["multiple"] !== attrs["multiple"]) {
    element.setAttribute(name, attrs["multiple"]);
  }
  domElementValue(element, attrs[name]);
};

/**
 * Custom set handler for the style attribute.
 */
set.style = function(name, element, previous, attrs) {
  style.patch(element, previous[name], attrs[name]);
};

module.exports = {
  patch: patch,
  set: set,
  unset: unset
};
