var query = require("dom-query");
var tree = require("./tree");
var isArray = Array.isArray;

function Layer() {
  this._mountedIndex = 0;
  this._mounted = Object.create(null);
}

Layer.prototype.mount = function(selector, factory, options) {
  this.unmount(selector);
  var containers = query.all(selector);
  if (!containers.length) {
    return;
  }
  if (containers.length > 1) {
    return containers.map(function(container) {
      return this.mount(container, mount);
    });
  }
  var container = containers[0];
  this._mountedIndex++;
  var mountId = "" + this._mountedIndex;

  options.container = container;
  options.factory = factory;
  options.inSvg = container.tagName === "svg";
  options.children = tree.create(container, factory, null);
  this._mounted[mountId] = options;
  return container.domLayerId = mountId;
}

Layer.prototype.unmount = function(selector) {
  var containers = query.all(selector);
  if (!containers.length) {
    return;
  }
  if (containers.length > 1) {
    for(var i = 0, len = containers.length; i < len; i++) {
      this.unmount(containers[i]);
    }
    return;
  }
  var container = containers[0];
  var mountId = container.domLayerId;
  if (!mountId) {
    return;
  }
  tree.remove(this._mounted[mountId].children);
  delete this._mounted[mountId];
  delete container.domLayerId;
}

Layer.prototype.mounted = function() {
  return this._mounted;
}

Layer.prototype.update = function(mountId) {
  if (arguments.length) {
    var mount = this._mounted[mountId];
    mount.children = tree.update(mount.container, mount.children, mount.factory, null, null, mount.inSvg);
    return;
  }
  for (mountId in self._mounted) {
    this.update(mountId);
  }
}

module.exports = Layer;
