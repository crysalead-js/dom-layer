var h = require("../helper/h");
var Text = require("../../node/text");

describe("Text", function() {

  it("verifies the type value", function() {

      expect(new Text().type).toBe("Text");

  });

  describe("toHtml", function() {

    it('stringify a text node', function() {

      var text = new Text("<hello>");

      var html = text.toHtml();
      expect(html).toBe("&lt;hello&gt;");

    });

  });

});