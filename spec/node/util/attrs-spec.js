var h = require("../../helper/h");
var _ = require("../../helper/util");
var patch = require("../../../tree/patch");

describe("attrs", function() {

  describe(".apply()", function() {

    it("sets attributes", function() {

      var from = h({ tagName: "div" });

      var to = h({
        tagName: "div",
        attrs: {
          src: "test.jpg"
        }
      });

      var rootNode = from.render();
      var newRoot = patch.node(from, to);

      expect(newRoot).toBe(rootNode);
      expect(newRoot.getAttribute("src")).toBe("test.jpg");

    });

    it("unsets attributes", function() {

      var from = h({
        tagName: "div",
        attrs: {
          a: "1",
          b: "2",
          c: "3"
        }
      });

      var to = h({
        tagName: "div",
        attrs: {
          a: "1",
          c: "3"
        }
      });

      var rootNode = from.render();
      var newRoot = patch.node(from, to);

      expect(newRoot).toBe(rootNode);
      expect(newRoot.getAttribute("a")).toBe("1");
      expect(newRoot.getAttribute("b")).toBe(null);
      expect(newRoot.getAttribute("c")).toBe("3");

    });

    it("unsets all attributes", function() {

      var from = h({
        tagName: "div",
        attrs: {
          a: "1",
          b: "2",
          c: "3"
        }
      });

      var to = h({ tagName: "div" });

      var rootNode = from.render();
      var newRoot = patch.node(from, to);

      expect(newRoot).toBe(rootNode);
      expect(newRoot.getAttribute("a")).toBe(null);
      expect(newRoot.getAttribute("b")).toBe(null);
      expect(newRoot.getAttribute("c")).toBe(null);

    });

    it("patches style correctly", function() {

      var from = h({ tagName: "div", attrs: { style: { width: "10px" } } });
      var to = h({ tagName: "div", attrs: { style: { padding: "5px" } } });

      var rootNode = from.render();
      expect(rootNode.style.width).toBe(_.style("width", "10px"));

      var patches = {};

      var newRoot = patch.node(from, to);
      expect(rootNode).toBe(newRoot);

      expect(newRoot.style.padding).toBe(_.style("padding", "5px"));
      expect(newRoot.style.width).toBe(_.style("width", ""));

    });

    describe("unsets properties", function() {

      it("removes all property if set to undefined", function() {

        var from = h({ tagName: "div", attrs: {
          style: { display: "none", width: "10px" }
        } });

        var to = h({ tagName: "div", attrs: { style: undefined } });

        from.render();
        var rootNode = patch.node(from, to);

        expect(rootNode.style.display).toBe(_.style("display", ""));
        expect(rootNode.style.width).toBe(_.style("width", ""));

      });

      it("removes a style if set to undefined", function() {

        var from = h({ tagName: "div", attrs: { style: { display: "none" } } });
        var to = h({ tagName: "div", attrs: { style: undefined } });

        from.render();
        var rootNode = patch.node(from, to);

        expect(rootNode.style.display).toBe(_.style("display", ""));

      });

      it("allows `null` for property value", function() {

        var from = h({ tagName: "input", attrs: { value: "hello" } });
        var to = h({ tagName: "input", attrs: { value: null } });

        from.render();
        var rootNode = patch.node(from, to);

        expect(rootNode.value).toBe(_.property("input", "value", null));

      });

    });

    describe("object as value", function() {

      it("support style as object", function() {

        var from = h({ tagName: "div", attrs: {
          style: {
            border: "none",
            className: "oops",
            display: "none"
          }
        }});

        var to = h({ tagName: "div", attrs: {
          style: {
            border: "1px solid #000",
            className: "oops",
            display: ""
          }
        }});

        var rootNode = from.render();
        expect(rootNode.style.border).toBe(_.style("border", "none"));
        expect(rootNode.style.className).toBe(_.style("className", "oops"));
        expect(rootNode.style.display).toBe(_.style("display", "none"));

        var newNode = to.render();
        expect(newNode.style.border).toBe(_.style("border", "1px solid #000"));
        expect(newNode.style.className).toBe(_.style("className", "oops"));
        expect(newNode.style.display).toBe(_.style("display", ""));

        var newRoot = patch.node(from, to);
        expect(newRoot.style.border).toBe(_.style("border", "1px solid #000"));
        expect(newRoot.style.className).toBe(_.style("className", "oops"));
        expect(newRoot.style.display).toBe(_.style("display", ""));
        expect(rootNode.style).toBe(newRoot.style);

      });

      it("support attributes as object", function() {

        var from = h({ tagName: "div", attrs: { foo: "bar", bar: "oops" } });
        var to = h({ tagName: "div", attrs: { foo: "baz", bar: "oops" } });
        var rootNode = from.render();

        var newRoot = patch.node(from, to);
        expect(newRoot.getAttribute("foo")).toBe("baz");
        expect(newRoot.getAttribute("bar")).toBe("oops");

      });

      it("patch nested properties in right only", function() {

        var from = h();
        var to = h({ tagName: "div", attrs: { style: { display: "none" } } });

        from.render();
        var elem = patch.node(from, to);

        expect(elem.style.display).toBe(_.style("display", "none"));

      });

    });

  });

});
