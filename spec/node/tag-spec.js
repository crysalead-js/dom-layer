var h = require("../helper/h");
var Tag = require("../../node/tag");

describe("Tag", function() {

  it("verifies `Tag` is a function", function() {
      expect(typeof Tag).toBe("function");
  });

  it("sets some defaults value on new instance", function() {
    var vnode = h();
    expect(vnode.tagName).toBe("div");
    expect(vnode.children).toEqual([]);
    expect(vnode.key).toBe(undefined);
  });

  it("set `'key'` property", function() {
    var vnode = h({ key: "10" });
    expect(vnode.key).toBe("10");
  });

  it("respects default SVG namespace", function() {
    var vnode = h({ tagName: "svg" });
    expect(vnode.namespace).toBe("http://www.w3.org/2000/svg");
  });

  it("respects default MathML namespace", function() {
    var vnode = h({ tagName: "math" });
    expect(vnode.namespace).toBe("http://www.w3.org/1998/Math/MathML");
  });

});