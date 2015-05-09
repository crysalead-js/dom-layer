# dom-layer

[![Build Status](https://travis-ci.org/crysalead-js/dom-layer.svg?branch=master)](https://travis-ci.org/crysalead-js/dom-layer)

**Warning: work in progress**

This library is a Virtual DOM implementation ala React. If this implementation is not the fasted one (though faster than the React and Mithril and with similar performances with Virtual DOM), it's probably the simplest one to dig into. It also provide a flexible API to be used as the foundation of your own front end solution.

## The Virtual DOM API

### The different type of nodes

Out of the box, two objects `Tag` and `Text` are available for representing DOM elements. But since this objects control their rendering, you should be able to build your custom "widget" based on the `Tag` one, but you will probably don't ever need it.

#### Example

Let's build the virtual representation of `<div id="message">Hello World</div>`.

```js
var Tag = require("dom-layer/node/tag");
var Text = require("dom-layer/node/text");

var root = new Tag("div", { props: { id: "message" } }, [new Text('Hello World')]);
```

`Tag` takes as first parameter the tag name you wan't to represent. The second parameter is an options object and the last parameter is an array of children (it can also be a factory function which returns a children array).

This is the verbose way to build a virtual tree but you can build your how abstraction on top of it to generete such trees in a painless way. React uses JSX for example but it would be also possible to make it work with some old school html templating.

### The `Tag`'s options parameter

The `Tag` node is configurable with the `options` parameter and the configurable options are the following:

```js
{
  props: {}     // The properties
  attrs: {      // The attributes
    style:      // The style
  },
  events: {}    // Delegable event (require an additionnal library),
  callbacks: {} // The callbacks to call during the node life cycle.
  data: {}      // Some custom data you want to embed with your virtual node.
}

- `props`: allows to set some DOM Element properties like `onclick`, `id`.
- `attrs`: is dedicated to attributes like `title`, `class`.
- `style`: contains all dynamic CSS definitions.
- `events`: allows to store some event's callback (require an additionnal library to work).
- `callbacks`: are are executed during the virtual node lifetime (e.g `'created'`, '`remove`')
- `data`: is optional but can contain some user's extra data.

## The mount/unmount API

To attach a virtual tree to a part of the DOM, it's necessary to mount it first.

#### Example

```js
var Layer = require("dom-layer");

var layer = new Layer();

var tree = new Tag("div", { props: { id: "message" } }, [new Text('Hello World')]);

var mountId = layer.mount("#mount-point", tree);
```

Then to update the virtual tree a simple call to the `update()` method with the id of the mount is enough.

```js
layer.update(mountId);
```

At this step the update has no real value since the virtual tree doesn't change. Let's make it a bit more interesting by creating a "trivial" component. Let's start with a simple `Component` function which have a `render()`.

```js

function Component() {
  this.order = "asc";
}
Component.prototype.render = function() {
  var children = [
    new Text("#1"),
    new Text("#2"),
    new Text("#3")
  ];
  if (this.order !== "asc") {
    children.reverse();
  }
  return new Tag("div", {}, children);
};
```

So according to the `order` value, the text will be displayed either sorted or reversed depending on its value. So now we have something more dynamic we can do the following:

```js
var component = new Component();

var factory = component.render.bind(component); // We are now using a function
var mountId = layer.mount("#mount-point", factory);
var mountPoint = document.getElementById("mount-point");

component.order = "desc";
layer.update(mountId); // Update the DOM
```

During the update, the `factory` function is executed again which generate another virtual tree, and then the DOM is patched according to changes.

The example above is rudimentary but shows how to deal with this library to build a higher abtraction.

Finally to unmount a virtual tree, the `unmount()` function need to be called with a selector. For example:

```js
layer.unmount("#mount-point");
```

## The rendering loop

Due to some architecture choices, the rendering loop has been leaved up to a higer level of abstraction. Indeed the rerendering need to be based on either a component is dirty or not and the relationship between the component and its childs and ancestors, to rerender the minimum of virtual trees.

However it still possible build a rudimentary one like the following for custom experimentations:

```js

var raf = window.requestAnimationFrame();

function tick() {
  layer.update(mountId);
  raf(tick);
}
raf(tick);
```

Be careful that this kind of rendering loop is time consuming and will quickly become an issue when the rendering time will exceed a specific threshold.
