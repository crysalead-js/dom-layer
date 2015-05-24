var valueEqual = require("../../util/value-equal");

describe("valueEqual", function() {

  it("compares arrays of values", function() {

    expect(valueEqual([1, 2, 3, 4], [1, 2, 3, 4])).toBe(true);

    expect(valueEqual([1, 2, 3, 4], [2, 3, 4, 1])).toBe(false);

  });

  it("compares arrays with non-arrays", function() {

    expect(valueEqual([1, 2, 3, 4], false)).toBe(false);
    expect(valueEqual([1, 2, 3, 4], true)).toBe(false);
    expect(valueEqual([1, 2, 3, 4], 3)).toBe(false);
    expect(valueEqual([1, 2, 3, 4], "abc")).toBe(false);

  });

  it("compares non-arrays", function() {

    expect(valueEqual(3, 3)).toBe(true);
    expect(valueEqual("abc", "abc")).toBe(true);

    expect(valueEqual(3, false)).toBe(false);
    expect(valueEqual("abc", 3)).toBe(false);

  });

});
