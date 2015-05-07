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
