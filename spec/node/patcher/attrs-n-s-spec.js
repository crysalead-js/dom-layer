var h = require("../../helper/h");
var _ = require("../../helper/util");
var patch = require("../../../src/tree/patch");
var attrsNS = require("../../../src/node/patcher/attrs-n-s");

var namespaces = attrsNS.namespaces;

describe("attrsNS", function() {

  describe(".patch()", function() {

    it("accepts empty value as previous attributes", function() {

      var element = document.createElementNS("http://www.w3.org/2000/svg", "image");
      attrsNS.patch(element, undefined, { "xlink:href": "test.jpg" });

      expect(element.getAttributeNS(namespaces["xlink"], "href")).toBe("test.jpg");

    });

    it("accepts empty value as previous attributes", function() {

      var element = document.createElementNS("http://www.w3.org/2000/svg", "image");
      attrsNS.patch(element, undefined, { "xlink:href": "test.jpg" });

      expect(element.getAttributeNS(namespaces["xlink"], "href")).toBe("test.jpg");

    });

    it("bails out when an attribute hasn't been modified", function() {

      var element = document.createElementNS("http://www.w3.org/2000/svg", "image");
      attrsNS.patch(element, { "xlink:href": "test.jpg" }, { "xlink:href": "test.jpg" });

      expect(element.getAttributeNS(namespaces["xlink"], "href")).toBe(null);

    });

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

      var element = from.render();
      expect(element.getAttributeNS(namespaces["xlink"], "href")).toBe("test.jpg");

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

      var element = from.render();
      from.patch(to);
      expect(element.getAttributeNS(namespaces["xlink"], "href")).toBeFalsy();
    });

  });

});
