var isArray = Array.isArray;

function valueEqual(a, b) {
  if (!isArray(a) || !isArray(b)) {
    return a === b;
  }

  var i = a.length;
  if (i != b.length) return false;
  while (i--) {
    if (a[i] !== b[i]) {
     return false;
    }
  }
  return true;
};

module.exports = valueEqual;