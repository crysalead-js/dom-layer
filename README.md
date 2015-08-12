# dom-layer

[![Build Status](https://travis-ci.org/crysalead-js/dom-layer.svg?branch=master)](https://travis-ci.org/crysalead-js/dom-layer)
[![Coverage Status](https://coveralls.io/repos/crysalead-js/dom-layer/badge.svg)](https://coveralls.io/r/crysalead-js/dom-layer)

This library is a Virtual DOM implementation. If this implementation is not the fastest one (though close to the fastest according to [vdom-benchmark](http://vdom-benchmark.github.io/vdom-benchmark/)), it's probably the simplest one to dig into. It also provide a flexible API to be used as the foundation of your own front end solution.

*You can however see some live benchmark in the [examples/speedtest](http://rawgit.com/crysalead-js/dom-layer/master/examples/speedtest/speedtest.html) directory.*

## Install

### Node.js

```
npm install dom-layer --save
```

## The Virtual DOM API

* Uses a straightforward `mount()`/`unmount()`/`update()` API
* Can mount an array of virtual nodes (not limited to a single root node)
* Delegated event system (via `events`)
* Supports DOM level 0 event (via `props`)
* Supports SVG, MathML as well as [Custom Elements & type extension](http://www.html5rocks.com/en/tutorials/webcomponents/customelements/)
* Animated transitions facilities through `"created"` & `"destroy"` hooks
* Allows to create his own virtual nodes
* Server side rendering facilities

### The different type of virtual node

Out of the box, only the `Tag` and `Text` node are available for representing DOM elements. It should be enough for most abstractions. However it still possible to build your own ones. For example you can create your own virutal nodes like `Comment` or `Doctype` for some particular reason or some `ShadowTag` to play with [Web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM). Since all virtual nodes embed their rendering & patching strategy, all options are possible.

#### Example

So as a simple example, let's build the virtual representation of `<div id="message">Hello World</div>`.

```js
var Tag = require("dom-layer").Tag; // or `domLayer.Tag` from a browser.
var Text = require("dom-layer").Text; // or `domLayer.Text` from a browser.

var root = new Tag("div", {attrs: {id: "message"}}, [new Text("Hello World!")]);
```

The first parameter of `Tag` is the tag name to represent. The second parameter is an object of options and the last parameter is the children array (which can also be a function which returns a children array, like a `render()` function).

Note: This is the verbose way to build a virtual tree but it was never the way to write a web application with. You should now build your own abstraction on top of it. React uses JSX for example as an abstraction layer but it would be possible to make it work with some old school html templating too or using a custom [hyperscript function](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript).

### The `Tag`'s options

The `Tag` node is configurable with the following options:

```js
{
  key: String|Integer // The node key value
  props: {},          // The properties
  attrs: {            // The attributes
    style: String|{}  // The style
  },
  attrsNS: {},        // The namespaced attributes (for SVG elements only)
  events: {},         // Delegated events (requires to create an event manager),
  hooks: {},          // The callbacks to call during the node life cycle.
  data: {}            // Some custom data you want to embed with your virtual node.
}
```

- `key`: a unique key to attach to a virtual node
- `props`: allows to set some DOM Element properties like `"onclick"`, `"id"`.
- `attrs`: is dedicated to attributes like `"title"`, `"class"`.
  - `style`: contains CSS definitions.
- `attrsNS`: is dedicated to attributes with a namespace like `"xlink:href"`.
- `events`: it contains delegated event callbacks (requires to run `require("dom-layer").events.init()` first).
- `hooks`: are callbacks executed during the virtual node lifetime (i.e. `'created'`, `'updated'`, `'remove'`, `'destroy'`)
- `data`: is optional but can contain some higher level abstraction data.

Note:
The `"key"` property is not really about performance but about identity. During reconciliation of keyed children, it will ensure that any child with a defined key will be correctly reordered (instead of clobbered). If virtual nodes don't have any key defined, it can be an issue with [`<input>` tag for example](http://jsfiddle.net/frosas/S4Dju/).

## The mount/unmount/update API

To mount a virtual tree into a DOM element you need to use `mount()`.

#### Example

```js
var Tree = require("dom-layer").Tree;

var tree = new Tree();

var view = new Tag("div", {props: {id: "message"}}, [
  new Text("Hello World!")
]);

var mountId = tree.mount("#mount-point", view);
```

Once a virtual tree is mounted, a call to the `update()` method with the new virtual tree will update the DOM accordingly.

```js
tree.update(mountId, new Tag("div", {props: {id: "message"}}, [
  new Text("Hello Universe!")
]));
```

However it's possible to direclty mount a function instead of simple virtual tree (like a render function).

So let's make it a bit more interesting by creating a "trivial" component. Let's start with a `Component` which contain a `render()` method:

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

The "states" of the component is in a way the `order` value, and the text sequence will be displayed either sorted or reversed depending on if it's equal to `'asc'` or `'desc'`. Let's see how we can mount it:

```js
var component = new Component();

var factory = component.render.bind(component);

// We are now using the `render()` function as the second parameter of `mount()`
var mountId = tree.mount("#mount-point", factory);

// Changing the order here doesn't change anything on screen since we need to run `update()` first.
component.order = "desc";

// Since the mounting has been done using the `render()` function, the second parameter is no more needed.
tree.update(mountId);
```

During updates, the "factory function" (i.e the `render()` function) is executed and returns the new virtual tree to render. Then the DOM is patched according to changes.

The example above is rudimentary but shows how to connect a higher abtraction with `dom-layer`.

Finally to unmount a virtual tree, the `unmount()` function needs to be called with the mount identifier. For example:

```js
tree.unmount(mountId);
```

## Events managment

There's two way to manage events with dom-layer. The first one is to use `props` like the following:

```js
var button = new Tag("button", {props: {onclick: function() {alert("Hello World!");}}}, [
  new Text("Click Me !")
]);
```

This kind of events are DOM level 0 events which mean that a function is registered as an event handler on the DOM element. In other words it's equivalent to the following html:

```html
<button onclick="alert('Hello World!')">Click Me !</button>
```

The other built-in event system is a delegated event system (similar to [React](https://facebook.github.io/react/) or [deku](https://github.com/dekujs/deku)). It uses the following syntax:

```js
domLayer = require("dom-layer");
domLayer.events.init();

var button = new Tag("button", {events: {onclick: function() {alert("Hello World!");}}}, [
  new Text("Click Me !")
]);
```

With delegated events, events are not attached to DOM element directly. The events are listened at the a level element (i.e `document.body` in this case) using a single event listener. This strategy is probably the most advantageous especially for virtual dom implementations. It tends to perform faster when the number of event handlers is high and works in a transparent manner. So that's why the DOM level 2 events (i.e which requires numerous `addEventListener()/removeEventListener()` on DOM patching) hasn't been implemented.

Note:
Make sure you initialized the event manager first by using `domLayer.events.init()` otherwise the events won't be catched on `document.body` (and therefore "forwarded" up to the event handler).

You can check an [example here](http://rawgit.com/crysalead-js/dom-layer/master/examples/input/input.html).

## Server side rendering

The server side strategy is pretty straightforward. To get the html representation of a virtual tree you can simply use the `toHtml()` method:

```js
var html = new Tag("button", {events: {onclick: function() {alert("Hello World!");}}}, [
  new Text("Click Me !")
]).toHtml();
```

The above piece of logic will be executed server side to generate a full HTML page. Then, client side, the `attach()` method will be used (instead of the `mount()` one) to mount a virtual tree on the rendered DOM element.

```html
<div id="mount-point"><button>Click Me !</button></div> <!-- the part rendered by the server side -->

<script type="text/javascript">
  var Tree = domLayer.Tree;
  var Tag = domLayer.Tag;
  var Text = domLayer.Text;

  var button = new Tag("button", {events: {onclick: function() {alert("Hello World!");}}}, [
    new Text("Click Me !")
  ]);

  var tree = new Tree();
  var mountId = tree.attach("#mount-point", button); // using `attach()` instead of `mount()`.
</script>
```

Note: the virtual tree rendered server side using `toHtml()` must be the one used with `attach()` client side. Attaching random virtual tree & templates won't work.

## Life cycle hooks

During `Tag` life cycle a number of callback "hooks" are called if defined. The available hooks for `Tag` are:

```js
{
  created: function(node, element) {}
  updated: function(node, element) {}
  remove: function(node, element) {}
  destroy: function(element, destroyCallback) {}
}
```

- `"created"` is called once a virtual node has been created. It receives the virtual node and the DOM element as parameter.
- `"updated"` is called every time an update occur on a virtual node. It receives the virtual node and the DOM element as parameter.
- `"remove"` is called when a virtual node is going to be removed. It receives the virtual node and the DOM element as parameter.
- `"destroy"` is called on element removal. It receives the DOM element to remove as parameter as well as the default removing callback (which actually removes the DOM element if called). Useful to delay a DOM element removing for some animation concerns.

## The rendering loop

Since the rerendering need to be based on whether a component is "dirty" or not, and since this decision depend mainly on the choosed architecture in a higher level, the rendering loop has been leaved up to a higher level of abstraction.

However it still possible to build a rudimentary one for some custom experimentations:

```js

var raf = window.requestAnimationFrame();

function tick() {
  layer.update(mountId);
  raf(tick);
}
raf(tick);
```

Be careful, this kind of rendering loop is time consuming and will quickly become an issue when the rendering time exceed a specific threshold.
