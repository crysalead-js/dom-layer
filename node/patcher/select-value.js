isArray = Array.isArray;

/**
 * This is a convenience function which preprocess the value attribute/property
 * set on a select/select multiple virtual nodes.
 *
 * If present on a select/select multiple virtual node the value is populated over
 * the contained `<option>` using the `"selected"` attribute.
 */
function selectValue(node) {
  if (node.tagName !== "select") {
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
  if (node.attrs && node.attrs.hasOwnProperty("value")) {
    delete node.attrs.value;
  }
  if (node.props && node.props.hasOwnProperty("value")) {
    delete node.props.value;
  }
}

function populateOptions(node, values) {
  if (node.tagName !== "option") {
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
  node.attrs.selected = "selected";
  node.props = node.props || {};
  node.props.selected = true;
}

module.exports = selectValue;
