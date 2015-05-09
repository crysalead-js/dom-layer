var h = require("../helper/h");
var _ = require("../helper/util");
var Text = require("../../node/text");
var patch = require("../../tree/patch");

describe("patch", function() {

  it("can patch text node", function() {

    var from = new Text("hello");
    var to = new Text("good bye");
    var rootNode = from.render();
    var newNode = to.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toEqual(newNode);

  });

  it("can patch embedded text node", function() {

    var from = h({}, ["hello"]);
    var to = h({}, ["good bye"]);
    var rootNode = from.render();
    var newNode = to.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toEqual(newNode);

  });

  it("can patch embedded text node and container", function() {

    var from = h({}, ["hello"]);
    var to = h({ tagName: "span" }, ["good bye"]);
    var rootNode = from.render();
    var newNode = to.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toEqual(newNode);

  });

  it("can patch text node with tag node", function() {

    var from = new Text("hello");
    var to = h({ tagName: "span" }, ["good bye"]);
    var rootNode = from.render();
    var newNode = to.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toEqual(newNode);

  });

  it("can patch tag node with text node", function() {

    var from = h({}, [h()]);
    var to = h({}, ["text"]);

    var rootNode = from.render();
    expect(rootNode.childNodes.length).toBe(1);
    expect(rootNode.childNodes[0].nodeType).toBe(1);

    var newRoot = patch.node(from, to);

    expect(newRoot).toBe(rootNode);
    expect(newRoot.childNodes.length).toBe(1);
    expect(newRoot.childNodes[0].nodeType).toBe(3);

  });

  it("can patch embedded text node by tag node", function() {

    var from = h({}, ["hello"]);
    var to = h({}, [h({ tagName: "span" }, ["good bye"])]);
    var rootNode = from.render();
    var newNode = to.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toEqual(newNode);

  });

  it("inserts an additionnal text node", function() {

    var from = h({}, ["hello"]);
    var to = h({}, ["hello", "to"]);
    var rootNode = from.render();
    var newNode = to.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toEqual(newNode);

  });

  it("inserts an additionnal tag node", function() {

    var from = h({}, [h({ tagName: "span" }, ["hello"])]);
    var to = h({}, [h({ tagName: "span" }, ["hello"]), h({ tagName: "span" }, ["to"])]);
    var rootNode = from.render();
    var newNode = to.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toEqual(newNode);

  });

  it("removes a text node", function () {

    var to = h({}, ["hello", "to"]);
    var from = h({}, ["hello"]);
    var rootNode = from.render();
    var newNode = to.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toEqual(newNode);

  });

  it("patch multiple changes", function() {

    var from = h({ tagName: "div", className: "hello" }, ["hello"]);
    var to = h({ tagName: "span", className: "good bye" }, ["good bye"]);
    var rootNode = from.render();
    var newNode = to.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toEqual(newNode);

  });

  it("do not ignores empty textnode", function() {

    var empty = h({ tagName: "span" }, [""]);
    var rootNode = empty.render();
    expect(rootNode.childNodes.length).toBe(1);

  });

  it("patches if different namespaces", function() {

    if (!_.hasNamespace() || (typeof module !== 'undefined' && module.exports)) {
        return;
    }

    var from = h({ properties: { attributes: { xmlns: "testing" } } });
    var to = h({ properties: { attributes: { xmlns: "undefined" } } });

    var rootNode = from.render();
    expect(rootNode.tagName).toBe("DIV");
    expect(rootNode.namespaceURI).toBe("testing");

    rootNode = to.update(from);

    expect(rootNode.tagName).toBe("DIV");
    expect(rootNode.namespaceURI).toBe("undefined");

  });

});
