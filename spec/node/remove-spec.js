var h = require("../helper/h");
var _ = require("../helper/util");

describe(".remove()", function() {

  var container;

  beforeEach(function() {
    container = document.createElement("div");
  });

  it("remove a text node", function() {

    var node = h("hello");
    var element = node.render();

    container.appendChild(element);
    expect(container.childNodes.length).toBe(1);

    node.remove();
    expect(container.childNodes.length).toBe(0);

  });

  it("remove a tag node", function() {

    var node = h({ tagName: "div" });
    var element = node.render();

    container.appendChild(element);
    expect(container.childNodes.length).toBe(1);

    node.remove();
    expect(container.childNodes.length).toBe(0);

  });

});