# dom-layer

[![Build Status](https://travis-ci.org/crysalead-js/dom-layer.svg?branch=master)](https://travis-ci.org/crysalead-js/dom-layer)

**Warning: work in progress**

This library is a Virtual DOM implementation ala React. If this implementation is not the fasted one (though faster than the React and Mithril and with similar performances with Virtual DOM according to [vdom-benchmark](http://vdom-benchmark.github.io/vdom-benchmark/)), it's probably the simplest one to dig into. It also provide a flexible API to be used as the foundation of your own front end solution.

*You can however see some live benchmark in the [examples/speedtest](http://rawgit.com/crysalead-js/dom-layer/master/examples/speedtest/speedtest.html) directory.*

## The Virtual DOM API

### The different type of nodes

Out of the box, two objects `Tag` and `Text` are available for representing DOM elements. But you should be able to build your custom "widget" based on the `Tag` one thought you probably won't need it.

#### Example

As an example, let's build the virtual representation of `<div id="message">Hello World</div>`.

```js
var Tag = require("dom-layer").Tag;
var Text = require("dom-layer").Text;

var root = new Tag("div", { props: { id: "message" } }, [new Text('Hello World')]);
```

`Tag` takes as first parameter the tag name to represent. The second parameter is an options object and the last parameter is an array of children (but can also be a function which returns a children array).

This is the verbose way to build a virtual tree but you can now build your own abstraction on top of it. React uses JSX for example but it would be possible to make it work with some old school html templating.

### The `Tag`'s options parameter

The `Tag` node is configurable with the `options` parameter and the values are the following:

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
```

- `props`: allows to set some DOM Element properties like `onclick`, `id`.
- `attrs`: is dedicated to attributes like `title`, `class`.
- `style`: contains CSS definitions.
- `events`: allows to store some event's callback (require an additionnal library to work).
- `callbacks`: are are executed during the virtual node lifetime (e.g `'created'`, '`remove`')
- `data`: is optional but can contain some user's extra data.

## The mount/unmount API

To attach a virtual tree to a part of the DOM, it's necessary to mount it first.

#### Example

```js
var Tree = require("dom-layer").Tree;

var tree = new Tree();

var view = new Tag("div", { props: { id: "message" } }, [new Text('Hello World')]);

var mountId = tree.mount("#mount-point", view);
```

When a virtual tree is mounted, a call to the `update()` method will update it.

```js
tree.update(mountId);
```

At this step the update has no real value since the passed virtual tree is an object so nothing is going to be updated. So let's make it a bit more interesting by creating a "trivial" component. Let's start with a `Component` function with a `render()` method like the following.

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

So according to the `order` value, the text will be displayed either sorted or reversed depending on its value. Now we have something more "dynamic" we can do the following:

```js
var component = new Component();

var factory = component.render.bind(component); // We are now using a function
var mountId = tree.mount("#mount-point", factory);
var mountPoint = document.getElementById("mount-point");

component.order = "desc"; //Changing the order
tree.update(mountId); // Update the DOM to see the result
```

During the update, the "factory" (i.e the passed function) is executed again which generate another virtual tree. Then the DOM is patched according to changes.

The example above is rudimentary but shows how to build a higher abtraction.

Finally to unmount a virtual tree, the `unmount()` function need to be called with a selector. For example:

```js
tree.unmount("#mount-point");
```

## The rendering loop

Since the rerendering need to be based on either a component is "dirty" or not and which depend mainly on the choosed architecture, the rendering loop has been leaved up to a higer level of abstraction.

However it still possible to build a rudimentary one for custom experimentations like the following:

```js

var raf = window.requestAnimationFrame();

function tick() {
  layer.update(mountId);
  raf(tick);
}
raf(tick);
```

Be careful, this kind of rendering loop is time consuming and will quickly become an issue when the rendering time exceed a specific threshold.
