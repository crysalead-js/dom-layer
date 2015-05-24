var domElementValue = require("dom-element-value");
var valueEqual = require("../../util/value-equal");
var dataset = require("./dataset");

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
  if (props[name] === undefined) {
    return;
  }
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
    unset.handlers[name](name, element, previous[name], previous);
  } else {
    element[name] = undefined;
  }
};
unset.handlers = Object.create(null);

/**
 * Custom set handler for the value attribute.
 */
set.handlers.value = function(element, previous, props) {
  if (valueEqual(domElementValue(element), props[name])) {
    return;
  }
  if (element.tagName === "SELECT") {
    if (previous["multiple"] !== props["multiple"]) {
      element.multiple = props["multiple"];
    }
    domElementValue(element, props[name]);
  } else {
    element[name] = props[name];
  }
};

/**
 * Custom set handler for the dataset attribute.
 */
set.handlers.dataset = function(name, element, previous, props) {
  dataset.patch(element, previous[name], props[name]);
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
