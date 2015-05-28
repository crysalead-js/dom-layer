var h = require("../helper/h");
var _ = require("../helper/util");
var patch = require("../../tree/patch");

describe("patch()", function() {

  it("patches arrays of virtual nodes", function() {

    var from = _.buildNodes(["#0", "#1"]);
    var to = _.buildNodes(["#0", "#1", "#2", "#3"]);

    var rootNode = from.render();
    var childNodes = _.rewrap(rootNode.childNodes);

    var toChildren = patch(rootNode, from.children, to.children);

    expect(toChildren).toBe(to.children);

    expect(rootNode.textContent).toBe('#0#1#2#3');

  });

});
