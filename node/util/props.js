var domElement = require("dom-element");
var dataset = require("./dataset");

/**
 * Maintains state of element properties.
 *
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of properties.
 * @param  Object props     The properties to match on.
 * @return Object props     The element properties state.
 */
function apply(element, previous, props) {
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
  if (set[name]) {
    set[name](name, element, previous, props);
  } else if (previous[name] !== props[name]) {
    element[name] = props[name];
  }
};

/**
 * Unsets a property.
 *
 * @param  String name      The property name to unset.
 * @param  Object element   A DOM element.
 * @param  Object previous  The previous state of properties.
 */
function unset(name, element, previous) {
  if (unset[name]) {
    unset[name](name, element, previous[name], previous);
  } else {
    element[name] = undefined;
  }
};

/**
 * Custom set handler for the value attribute.
 */
set.value = function(element, previous, props) {
  if (previous["multiple"] !== props["multiple"]) {
    element.multiple = props["multiple"];
  }
  domElement.value(element, newValue);
};

/**
 * Custom set handler for the dataset attribute.
 */
set.dataset = function(name, element, previous, props) {
  dataset.apply(element, previous[name], props[name]);
};

/**
 * Custom unset handler for the dataset attribute.
 */
unset.dataset = function(name, element, previous) {
  dataset.apply(element, previous[name], {});
};

module.exports = {
  apply: apply,
  set: set,
  unset: unset
};
