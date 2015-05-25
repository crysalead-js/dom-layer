# dom-layer

[![Build Status](https://travis-ci.org/crysalead-js/dom-layer.svg?branch=master)](https://travis-ci.org/crysalead-js/dom-layer)

**Warning: work in progress**

This library is a Virtual DOM implementation ala React. If this implementation is not the fasted one (though faster than the React and Mithril and with similar performances with Virtual DOM according to [vdom-benchmark](http://vdom-benchmark.github.io/vdom-benchmark/)), it's probably the simplest one to dig into. It also provide a flexible API to be used as the foundation of your own front end solution.

*You can however see some live benchmark in the [examples/speedtest](http://rawgit.com/crysalead-js/dom-layer/master/examples/speedtest/speedtest.html) directory.*

## The Virtual DOM API

### The different type of nodes

Out of the box, two objects `Tag` and `Text` are available for representing DOM elements. But you should be able to build your own ones based on the `Tag` one. It can be useful if you consider to manage virutal nodes like `Comment` or `Doctype` in a higher level of abstraction.

#### Example

So as an example, let's build the virtual representation of a simple `<div id="message">Hello World</div>`.

```js
var Tag = require("dom-layer").Tag;
var Text = require("dom-layer").Text;

var root = new Tag("div", {attrs: {id: "message"}}, [new Text("Hello World!")]);
```

`Tag` takes as first parameter the tag name to represent. The second parameter is an object of options and the last parameter is the children array (but can also be a function which returns a children array, like a `render()` function).

Note: This is the verbose way to build a virtual tree but it was never the way to write a web application with. You should now build your own abstraction on top of it. React uses JSX for example as an abstraction layer but it would be possible to make it work with some old school html templating too.

### The `Tag`'s options

The `Tag` node is configurable with the `options` parameter and the configurable values are the following:

```js
{
  props: {}     // The properties
  attrs: {      // The attributes
    style:      // The style
  },
  attrsNS: {},  // The namespaced attributes (for SVG elements only)
  events: {}    // Delegated events (requires to create an event manager),
  callbacks: {} // The callbacks to call during the node life cycle.
  data: {}      // Some custom data you want to embed with your virtual node.
}
```

- `props`: allows to set some DOM Element properties like `"onclick"`, `"id"`.
- `attrs`: is dedicated to attributes like `title"`, `"class"`.
- `style`: contains CSS definitions.
- `attrsNS`: is dedicated to attributes with a namespace like `"xlink:href"`.
- `events`: allows to store some event's callback (require an additionnal library to work).
- `callbacks`: are are executed during the virtual node lifetime (e.g `'created'`, `'remove'`)
- `data`: is optional but can contain some user's extra data.

## The mount/unmount API

To mount a virtual tree into a DOM element, it's necessary to mount it first.

#### Example

```js
var Tree = require("dom-layer").Tree;

var tree = new Tree();

var view = new Tag("div", {props: {id: "message"}}, [
  new Text("Hello World!")
]);

var mountId = tree.mount("#mount-point", view);
```

Once a virtual tree is mounted, a call to the `update()` method will update it.

```js
tree.update(mountId, new Tag("div", {props: {id: "message"}}, [
  new Text("Hello Universe!")
]));
```

However it's also possible to mount a function instead of virtual tree (like a render function which will return a virtual tree to render).

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

So according to the `order` value, the text will be displayed either sorted or reversed depending on its value. Let's see how we can make it work:

```js
var component = new Component();

var factory = component.render.bind(component);

// We are now using the `render()` function as mounting parameter
var mountId = tree.mount("#mount-point", factory);

var mountPoint = document.getElementById("mount-point");

// Changing the order doesn't change anything on screen we need to run `update()`
component.order = "desc";

// Since the mounting has been done using the `render()` function, the second parameter is no more needed.
tree.update(mountId);
```

During the update, the "factory function" (i.e the `render()` function) is executed and returns the new virtual tree. Then the DOM is patched according to changes.

The example above is rudimentary but shows how to connect a higher abtraction to this virtual dom implementation.

Finally to unmount a virtual tree, the `unmount()` function need to be called with a selector. For example:

```js
tree.unmount("#mount-point");
```

## Events managment

There's two way to manage events with dom-layer. The first one is to use `props` like the following:

```js
var button = new Tag("button", {props: {onclick: function() {alert("Hello World!");}}}, [
  new Text("Click Me !")
]);
```

This kind of events are DOM level 0 events which mean that a function is registered as an event handler on the DOM element.

The other built-in event system is a delegated event system ala React which use the following syntax:

```js
domLayer = require("dom-layer");
domLayer.events.init();

var button = new Tag("button", {events: {onclick: function() {alert("Hello World!");}}}, [
  new Text("Click Me !")
]);
```

With delegated events, events are not attached to DOM element directly. The events are listened at the top level (i.e `document.body`) using a single event listener. This strategy is probably the most advantageous especially for virtual dom implementations and tends to perform faster when the number of event handlers is high.

Note:
Make sure you initialized the event manager first by using `domLayer.events.init()` otherwise the events won't be catched on `document.body` (and therefore "forwarded" on the defined event handler).

You can check an [example here](http://rawgit.com/crysalead-js/dom-layer/master/examples/input/input.html).

## Server side rendering

**Warning: here be dragons**

The server side rendering is pretty straight forward. To get the html representation of a virtual tree, you can simply use the `toHtml()` method:

```js
var html = new Tag("button", {events: {onclick: function() {alert("Hello World!");}}}, [
  new Text("Click Me !")
]).toHtml();
```

So the above piece of logic will be executed server side to generate a full HTML page. Then client side the `attach()` method will be used instead of the `mount()` to mount a virtual tree on a DOM element which already contain some rendered html.

```html
<div id="mount-point"><div>Hello World !</div></div> <!-- the part rendered by the server side -->

<script type="text/javascript">
  var Tree = domLayer.Tree;
  var Tag = domLayer.Tag;
  var Text = domLayer.Text;

  var button = new Tag("button", {events: {onclick: function() {alert("Hello World!");}}}, [
    new Text("Click Me !")
  ]);

  var tree = new Tree();
  var mountId = tree.attach("#mount-point", button);
</script>
```

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
