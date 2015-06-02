/**
 * Returns a `'class1 class3" ...'` string from
 * a `{ class1: true, class2: false, class3: true }` object.
 *
 * @param  Object className The keys/values object to stringify.
 * @return String           The corresponding string.
 */
function stringifyClass(classAttr) {
  if (typeof classAttr === "string") {
    return classAttr;
  }
  var classes = [];
  for (var key in classAttr) {
    if (classAttr[key]) {
      classes.push(key);
    }
  }
  return classes.join(" ");
}

module.exports = stringifyClass;
