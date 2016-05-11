var selectValue = require("../../../src/node/patcher/select-value");

describe("selectValue()", function() {

  it("bails out when attributes are empty", function() {

    var element = document.createElement('div');
    selectValue(element);
    expect(element).toBe(element);

  });

});
