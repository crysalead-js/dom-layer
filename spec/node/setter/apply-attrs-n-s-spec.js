var h = require("../../helper/h");
var _ = require("../../helper/util");
var patch = require("../../../tree/patch");
var applyAttrsNS = require("../../../node/setter/apply-attrs-n-s");

var namespaces = applyAttrsNS.namespaces;

describe("applyAttrsNS", function() {

  it("sets namespaced attributes", function() {

    var from = h({
      tagName: "image",
      attrsNS: {
        "xlink:href": "test.jpg"
      },
      namespace: "http://www.w3.org/2000/svg"
    });

    var rootNode = from.render();
    expect(rootNode.getAttributeNS(namespaces["xlink"], "href")).toBe("test.jpg");

  });

  it("unsets namespaced attributes", function() {

    var from = h({
      tagName: "image",
      attrsNS: {
        "xlink:href": "test.jpg"
      },
      namespace: "http://www.w3.org/2000/svg"
    });

    var to = h({
      tagName: "image",
      attrsNS: {},
      namespace: "http://www.w3.org/2000/svg"
    });

    var rootNode = from.render();
    var newRoot = patch.node(from, to);
    expect(newRoot).toBe(rootNode);
    expect(rootNode.getAttributeNS(namespaces["xlink"], "href")).toBeFalsy();
  });

});
