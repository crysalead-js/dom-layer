var query = require("dom-query");
var attach = require("./attach");
var render = require("./render");
var update = require("./update");
var remove = require("./remove");
var isArray = Array.isArray;

function Tree() {
  this._mounted = Object.create(null);
}

/**
 * Mounts a virtual tree into a passed selector.
 *
 * @param String|Object   selector A CSS string selector or a DOMElement identifying the mounting point.
 * @param Function|Object factory  A factory function which returns a virtual tree or the virtual tree itself.
 * @param Object          mount    Some extra data to attach to the mount.
 */
Tree.prototype.mount = function(selector, factory, mount) {
  mount = mount || {};
  var containers = query.all(selector);
  if (containers.length !== 1) {
    throw new Error("The selector must identify an unique DOM element");
  }

  var container = containers[0];
  if (container.domLayerTreeId) {
    this.unmount(container.domLayerTreeId);
  }

  var mountId = mount.mountId ? mount.mountId : this.uuid();
  var fragment = document.createDocumentFragment();

  mount.factory = factory;
  mount.children = render(fragment, factory, null);
  if (mount.transclude) {
    mount.transcluded = container;
    if (fragment.childNodes.length !== 1) {
      throw new Error('Transclusion requires a single DOMElement to transclude.');
    }
    mount.container = fragment.childNodes[0];
    container.parentNode.replaceChild(mount.container, container);
  } else {
    container.appendChild(fragment);
    mount.container = container;
  }
  this._mounted[mountId] = mount;
  return mount.container.domLayerTreeId = mountId;
};

/**
 * Attaches a virtual tree onto a previously rendered DOM tree.
 *
 * @param String|Object   selector A CSS string selector or a DOMElement identifying the mounting point
 *                                 containing a previously rendered DOM tree.
 * @param Function|Object factory  A factory function which returns a virtual tree or the virtual tree itself.
 * @param Object          mount    Some extra mount to attach to the mount.
 */
Tree.prototype.attach = function(selector, factory, mount) {
  mount = mount || {};
  var containers = query.all(selector);
  if (containers.length !== 1) {
    throw new Error("The selector must identify an unique DOM element");
  }

  var container = containers[0];
  if (container.domLayerTreeId) {
    this.unmount(container.domLayerTreeId);
  }

  var mountId = mount.mountId ? mount.mountId : this.uuid();
  mount.container = container;
  mount.factory = factory;
  mount.children = attach(container, factory, null);
  this._mounted[mountId] = mount;
  return container.domLayerTreeId = mountId;
};

/**
 * Returns a UUID identifier.
 *
 * @return String a unique identifier
 */
Tree.prototype.uuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
};

/**
 * Unmounts a virtual tree.
 *
 * @param String mountId An optionnal mount identifier or none to update all mounted virtual trees.
 */
Tree.prototype.unmount = function(mountId) {
  if (!arguments.length) {
    this.unmount(Object.keys(this._mounted));
    return;
  }
  var mounted = Array.isArray(mountId) ? mountId : arguments;
  var len = mounted.length;
  for (var i = 0; i < len; i++) {
    var mountId = mounted[i];
    var mount = this._mounted[mountId];
    if (mount) {
      if (mount.transclude) {
        mount.container.parentNode.replaceChild(mount.transcluded, mount.container);
      } else {
        remove(mount.children);
      }
      delete mount.container.domLayerTreeId;
      delete this._mounted[mountId];
    }
  }
};

/**
 * Updates a mount (ie. run the factory function and updates the DOM according to occured changes).
 *
 * @param String mountId An optionnal mount identifier or none to update all mounted virtual trees.
 * @param String tree    An optionnal virtual tree to use.
 */
Tree.prototype.update = function(mountId, tree) {
  if (arguments.length) {
    var mount = this._mounted[mountId];
    if (mount) {
      var active = document.activeElement;
      mount.children = update(mount.container, mount.children, tree ? tree : mount.factory, null);
      if (document.activeElement !== active) {
        active.focus();
      }
    }
    return;
  }
  for (mountId in this._mounted) {
    this.update(mountId);
  }
};

/**
 * Returns the definition of a mounted tree all of them if no `mountId` is provided.
 *
 * @param  String mountId A mount identifier or none to get all mounts.
 * @return Object         A mount definition or all of them indexed by their id.
 */
Tree.prototype.mounted = function(mountId) {
  if (arguments.length) {
    return this._mounted[mountId];
  }
  return this._mounted;
};

module.exports = Tree;
