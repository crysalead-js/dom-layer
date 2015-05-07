var h = require("../helper/h");
var Tag = require("../../node/tag");

describe("Tag", function() {

  it("verifies `Tag` is a function", function() {
      expect(typeof Tag).toBe("function");
  });

  it("sets some defaults value on new instance", function() {
    var tag = h();
    expect(tag.tagName).toBe("div");
    expect(tag.children).toEqual([]);
    expect(tag.key).toBe(undefined);
  });

  it("set `'key'` property", function() {
    var tag = h({ key: "10" });
    expect(tag.key).toBe("10");
  });

  it("respects default SVG namespace", function() {
    var tag = h({ tagName: "svg" });
    expect(tag.namespace).toBe("http://www.w3.org/2000/svg");
  });

  it("respects default MathML namespace", function() {
    var tag = h({ tagName: "math" });
    expect(tag.namespace).toBe("http://www.w3.org/1998/Math/MathML");
  });

});