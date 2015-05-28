var domElementValue = require("dom-element-value");
var h = require("../../helper/h");
var _ = require("../../helper/util");
var patch = require("../../../tree/patch");

describe("props", function() {

  describe(".patch()", function() {

    it("sets an property", function() {

      var from = h();
      var to = h({ props: { className: "active" } });

      var rootNode = from.render();
      var newRoot = patch.node(from, to);

      expect(newRoot).toBe(rootNode);
      expect(newRoot.className).toBe("active");

    });

    it("sets the `name` property", function() {

      var node = h({ tagName: "input", attrs: { name: "input1" } });
      var element = node.render();
      expect(element.name).toBe("input1");

    });

    it("sets the `dataset` property", function() {

      var a = h({ tagName: "div", props: { dataset: { foo: "bar", bar: "oops" } } });
      var rootNode = a.render();

      expect(rootNode.dataset.foo).toBe("bar");
      expect(rootNode.dataset.bar).toBe("oops");

    });

    it("ignores `undefined` property", function() {

      var node = h({ tagName: "div", props: { special: undefined } });
      var rootNode = node.render();
      expect("special" in rootNode).toBe(false);

    });

    it("ignores `undefined` value property", function() {

      var node = h({ tagName: "div", props: { value: undefined } });
      var rootNode = node.render();
      expect("value" in rootNode).toBe(false);

    });

    it("patches a property", function() {

      var from = h({ props: { className: "hello" } });
      var to = h({ props: { className: "world" } });
      var rootNode = from.render();
      expect(rootNode.className).toBe("hello");

      var newRoot = patch.node(from, to);
      expect(newRoot.className).toBe("world");

    });

    it("patches the `dataset` property", function() {

      var from = h({ props: { dataset: { foo: "bar", bar: "oops" } } });
      var to = h({ props: { dataset: { foo: "baz", bar: "oops" } } });
      var rootNode = from.render();
      expect(rootNode.dataset.foo).toBe("bar");
      expect(rootNode.dataset.bar).toBe("oops");

      var newRoot = patch.node(from, to);
      expect(newRoot.dataset.foo).toBe("baz");
      expect(newRoot.dataset.bar).toBe("oops");

    });

    it("populates the `value` property on select", function() {

      var select = h({ tagName: "select", props: { value: "bar" } }, [
        h({tagName: "option", props: {value: "foo"}}, ["foo"]),
        h({tagName: "option", props: {value: "bar"}}, ["bar"])
      ]);

      var element = select.render();
      expect(domElementValue(element)).toBe("bar");

    });

    it("populates the `value` property on select multiple", function() {

      var select = h({ tagName: "select", props: { multiple: true, value: ["foo", "bar"] } }, [
        h({tagName: "option", props: {value: "foo"}}, ["foo"]),
        h({tagName: "option", props: {value: "bar"}}, ["bar"])
      ]);

      var element = select.render();
      expect(domElementValue(element).sort()).toEqual(["bar", "foo"]);

    });

    it("populates the `value` property on select multiple using groups", function() {

      var select = h({ tagName: "select", props: { multiple: true, value: ["foo", "bar"] } }, [
        h({tagName: "optgroup", attrs: {label: "foo-group"}}, [
          h({tagName: "option", props: {value: "foo"}}, ["foo"])
        ]),
        h({tagName: "optgroup", attrs: {label: "bar-group"}}, [
          h({tagName: "option", props: {value: "bar"}}, ["bar"])
        ])
      ]);

      var element = select.render();
      expect(domElementValue(element).sort()).toEqual(["bar", "foo"]);

    });

    it("unsets a property", function() {

      var from = h({ tagName: "div", props: { onclick: function() {} }});
      var rootNode = from.render();
      expect(typeof rootNode.onclick).toBe("function");

      var to = h({ tagName: "div", props: {}});
      var newRoot = patch.node(from, to);
      expect(rootNode.onclick).toBe(null);

    });

    it("unsets a property when equal to `undefined`", function() {

      var from = h({ tagName: "div", props: { onclick: function() {} } });
      var rootNode = from.render();
      expect(typeof rootNode.onclick).toBe("function");

      var to = h({ tagName: "div", props: { onclick: undefined } });
      var newRoot = patch.node(from, to);
      expect(rootNode.onclick).toBe(null);

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

  });

});
