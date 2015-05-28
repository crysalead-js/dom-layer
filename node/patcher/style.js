var domElementCss = require("dom-element-css");

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
  if (typeof style === "object") {
    if (typeof previous === "object") {
      for (rule in previous) {
        if (!style[rule]) {
          domElementCss(element, rule, null);
        }
      }
      domElementCss(element, style);
    } else {
      if (previous) {
        element.setAttribute("style", "");
      }
      domElementCss(element, style);
    }
  } else {
    element.setAttribute("style", style || "");
  }
}

module.exports = {
  patch: patch
};
