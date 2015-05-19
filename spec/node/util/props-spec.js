var h = require("../../helper/h");
var _ = require("../../helper/util");
var patch = require("../../../tree/patch");

describe("props", function() {

  describe(".apply()", function() {

    it("doesn't set undefined props", function() {

      var node = h({ tagName: "div", props: { special: undefined } });
      var rootNode = node.render();
      expect("special" in rootNode).toBe(false);

    });

    it("sets dataset", function() {

      var a = h({ tagName: "div", props: { dataset: { foo: "bar", bar: "oops" } } });
      var rootNode = a.render();

      expect(rootNode.dataset.foo).toBe("bar");
      expect(rootNode.dataset.bar).toBe("oops");

    });

    it("unsets dataset", function() {

      var from = h({ tagName: "div", props: { dataset: { foo: "bar", bar: "oops" } } });
      var rootNode = from.render();

      var to = h({ tagName: "div", props: { dataset: { foo: "bar", baz: "hello" } } });
      var newRoot = patch.node(from, to);

      expect(rootNode).toEqual(newRoot);
      expect(newRoot.dataset.foo).toBe("bar");
      expect(newRoot.dataset.bar).toBe(undefined);
      expect(newRoot.dataset.baz).toBe("hello");

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

});
