/**
 * A couple of polyfills to include if deprecated browser compatibility is not an option.
 */

/**
 * IE8 [].map polyfill Reference: http://es5.github.io/#x15.4.4.19
 */
if (!Array.prototype.map) {
  Array.prototype.map = function (callback, thisArg) {
    var a, k;
    // ReSharper disable once ConditionIsAlwaysConst
    if (DEBUG && this == null) {
      throw new TypeError("this==null");
    }
    var o = Object(this);
    var len = o.length >>> 0;
    if (DEBUG && typeof callback != "function") {
      throw new TypeError(callback + " isn't func");
    }
    a = new Array(len);
    k = 0;
    while (k < len) {
      var kValue, mappedValue;
      if (k in o) {
        kValue = o[k];
        mappedValue = callback.call(thisArg, kValue, k, o);
        a[k] = mappedValue;
      }
      k++;
    }
    return a;
  };
}

/**
 * Object create polyfill
 */
if (!Object.create) {
  Object.create = function (o) {
    function f() { }
    f.prototype = o;
    return new f();
  };
}


/**
 * Object.keys() polyfill
 */
if (!Object.keys) {
  Object.keys = (function (obj) {
    var keys = [];
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }
    return keys;
  });
}

/**
 * Array.isArray() polyfill
 */
if (!Array.isArray) {
  var objectToString = {}.toString;
  Array.isArray = (function (a) { return objectToString.call(a) === "[object Array]"; });
}
