var h = require("../../helper/h");
var _ = require("../../helper/util");

describe("applyProps", function() {

  it("delegates to attributes", function() {

    var from = h({
      tagName: "div",
      props: {
        attributes: {
          src: "test.jpg"
        }
      }
    });

    var rootNode = from.render();
    expect(rootNode.getAttribute("src")).toBe("test.jpg");

  });

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

});
