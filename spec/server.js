var domLayer = require('..');
var Tag = domLayer.Tag;
var Text = domLayer.Text;

describe("Server side tests", function() {

  describe(".toHtml()", function() {

    it("renders a virtual tree", function() {

      var html = new Tag("button", {events: {onclick: function() {alert("Hello World!");}}}, [
        new Text("Click Me !")
      ]).toHtml();
      expect(html).toBe("<button>Click Me !</button>");

    });

  });

});
