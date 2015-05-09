var h = require("../../helper/h");
var _ = require("../../helper/util");
var patch = require("../../../tree/patch");

describe("applyProps", function() {

  it("doesn't set undefined props", function() {

    var node = h({ tagName: "div", props: { special: undefined } });
    var rootNode = node.render();
    expect("special" in rootNode).toBe(false);

  });

  it("sets dataset", function() {

    var a = h({ tagName: "div", props: { dataset: { foo: "bar", bar: "oops" } } });
    var rootNode = a.render();
    var d1 = rootNode.dataset;
    expect(rootNode.dataset.foo).toBe("bar");
    expect(rootNode.dataset.bar).toBe("oops");

  });

  it("removes removed properties", function() {

    var from = h({ tagName: "div", props: { onclick: function() {} }});
    var rootNode = from.render();
    expect(typeof rootNode.onclick).toBe("function");

    var to = h({ tagName: "div", props: {}});
    var newRoot = patch.node(from, to);
    expect(typeof rootNode.onclick).toBe("undefined");

  });

});
