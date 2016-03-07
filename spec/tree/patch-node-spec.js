var h = require("../helper/h");
var _ = require("../helper/util");
var Text = require("../../src/node/text");
var patch = require("../../src/tree/patch");

describe(".patch()", function() {

  it("patches a text node", function() {

    var from = new Text("hello");
    var to = new Text("good bye");
    var element = from.render();

    expect(from.patch(to)).toBe(element);

  });

  it("patches a wrapped text node", function() {

    var from = h({}, ["hello"]);
    var to = h({}, ["good bye"]);
    var element = from.render();

    expect(from.patch(to)).toBe(element);

  });

  it("patches a wrapped text node with its container", function() {

    var from = h({}, ["hello"]);
    var to = h({ tagName: "span" }, ["good bye"]);
    var element = from.render();

    expect(from.patch(to)).not.toBe(element);

  });

  it("patches a text node into a tag node", function() {

    var from = new Text("hello");
    var to = h({ tagName: "span" }, ["good bye"]);
    var element = from.render();

    expect(from.patch(to)).not.toBe(element);

  });

  it("can patch a tag node into a text node", function() {

    var from = h({}, [h()]);
    var to = h({}, ["text"]);

    var element = from.render();
    expect(element.childNodes.length).toBe(1);
    expect(element.childNodes[0].nodeType).toBe(1);

    from.patch(to);

    expect(element.childNodes.length).toBe(1);
    expect(element.childNodes[0].nodeType).toBe(3);

  });

  it("patches a wrapped a text node by a tag node", function() {

    var from = h({}, ["hello"]);
    var to = h({}, [h({ tagName: "span" }, ["good bye"])]);
    var element = from.render();

    expect(from.patch(to)).toBe(element);

  });

  it("inserts an additionnal text node", function() {

    var from = h({}, ["hello"]);
    var to = h({}, ["hello", "to"]);
    var element = from.render();

    expect(from.patch(to)).toBe(element);

    // Verify assumption that children in `from` tree have a parent
    from.children.forEach(function (child) {
      expect(child.parent).toBeTruthy();
    });

    // Verify that children in `to` tree have a parent after patching
    to.children.forEach(function (child) {
      expect(child.parent).toBeTruthy();
    });
  });

  it("inserts an additionnal tag node", function() {

    var from = h({}, [h({ tagName: "span" }, ["hello"])]);
    var to = h({}, [h({ tagName: "span" }, ["hello"]), h({ tagName: "span" }, ["to"])]);
    var element = from.render();

    expect(from.patch(to)).toBe(element);

    // Verify assumption that children in `from` tree have a parent
    from.children.forEach(function (child) {
      expect(child.parent).toBeTruthy();
    });

    // Verify that children in `to` tree have a parent after patching
    to.children.forEach(function (child) {
      expect(child.parent).toBeTruthy();
    });
  });

  it("removes a text node", function () {

    var to = h({}, ["hello", "to"]);
    var from = h({}, ["hello"]);
    var element = from.render();

    expect(from.patch(to)).toBe(element);

  });

  it("patches multiple changes", function() {

    var from = h({ tagName: "div", className: "hello" }, ["hello"]);
    var to = h({ tagName: "span", className: "good bye" }, ["good bye"]);
    var element = from.render();

    expect(from.patch(to)).not.toBe(element);

  });

  it("does not ignores empty textnode", function() {

    var empty = h({ tagName: "span" }, [""]);
    var element = empty.render();
    expect(element.childNodes.length).toBe(1);

  });

  it("patches if different namespaces", function() {

    var from = h({ attrs: { xmlns: "testing" } });
    var to = h({ attrs: { xmlns: "undefined" } });

    var element = from.render();
    expect(element.tagName.toLowerCase()).toBe("div");
    expect(element.namespaceURI).toBe("testing");

    element = from.patch(to);

    expect(element.tagName.toLowerCase()).toBe("div");
    expect(element.namespaceURI).toBe("undefined");

  });

  it("checks that `domLayerNode` is correctly updated when `events` is defined", function() {

    var from = h({ events: { "onclick": function() {} } });
    var to = h({ events: { "onclick": function() {} } });

    var element = from.render();
    expect(element.domLayerNode).toBe(from);

    element = from.patch(to);

    expect(element.domLayerNode).toBe(to);

  });

  it("checks that `domLayerNode` is unsetted when no `events` are defined", function() {

    var from = h({ events: { "onclick": function() {} } });
    var to = h();

    var element = from.render();
    expect(element.domLayerNode).toBe(from);

    element = from.patch(to);

    expect(element.domLayerNode).toBe(undefined);

  });

  it("checks that `domLayerNode` is correctly updated when `data` is defined", function() {

    var from = h({ data: { varname: 'value1' } });
    var to = h({ data: { varname: 'value2' } });

    var element = from.render();
    expect(element.domLayerNode).toBe(from);

    element = from.patch(to);

    expect(element.domLayerNode).toBe(to);

  });

  it("checks that `domLayerNode` is unsetted when no `data` are defined", function() {

    var from = h({ data: { varname: 'value' } });
    var to = h();

    var element = from.render();
    expect(element.domLayerNode).toBe(from);

    element = from.patch(to);

    expect(element.domLayerNode).toBe(undefined);

  });

  it("bails out when trying to patch the same node", function() {

    var from = new Text("hello");
    var element = from.render();

    expect(from.patch(from)).toBe(element);

  });

});
