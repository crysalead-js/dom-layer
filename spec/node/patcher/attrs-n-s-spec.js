var h = require("../../helper/h");
var _ = require("../../helper/util");
var patch = require("../../../src/tree/patch");
var attrsNS = require("../../../src/node/patcher/attrs-n-s");

var namespaces = attrsNS.namespaces;

describe("attrsNS", function() {

  describe(".patch()", function() {

    it("sets namespaced attributes", function() {

      var from = h({
        tagName: "image",
        attrs: {
          xmlns: "http://www.w3.org/2000/svg"
        },
        attrsNS: {
          "xlink:href": "test.jpg"
        }
      });

      var rootNode = from.render();
      expect(rootNode.getAttributeNS(namespaces["xlink"], "href")).toBe("test.jpg");

    });

    it("unsets namespaced attributes", function() {

      var from = h({
        tagName: "image",
        attrs: {
          xmlns: "http://www.w3.org/2000/svg"
        },
        attrsNS: {
          "xlink:href": "test.jpg"
        }
      });

      var to = h({
        tagName: "image",
        attrs: {
          xmlns: "http://www.w3.org/2000/svg"
        },
        attrsNS: {}
      });

      var rootNode = from.render();
      var newRoot = patch.node(from, to);
      expect(newRoot).toBe(rootNode);
      expect(rootNode.getAttributeNS(namespaces["xlink"], "href")).toBeFalsy();
    });

  });

});
