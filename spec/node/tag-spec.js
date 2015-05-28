var h = require("../helper/h");
var Tag = require("../../node/tag");

describe("Tag", function() {

  it("verifies the type value", function() {

      expect(new Tag().type).toBe("Tag");

  });

  it("sets some defaults value on new instance", function() {

    var tag = h();
    expect(tag.tagName).toBe("div");
    expect(tag.children).toEqual([]);
    expect(tag.key).toBe(undefined);

  });

  it("sets the `key` property", function() {

    var tag = h({ key: "10" });
    expect(tag.key).toBe("10");

  });

  it("sets default SVG namespace", function() {

    var tag = h({ tagName: "svg" });
    var element = tag.render();
    expect(tag.namespace).toBe("http://www.w3.org/2000/svg");
    expect(element.namespaceURI).toBe("http://www.w3.org/2000/svg");

  });

  it("sets default MathML namespace", function() {

    var tag = h({ tagName: "math" });
    var element = tag.render();
    expect(tag.namespace).toBe("http://www.w3.org/1998/Math/MathML");
    expect(element.namespaceURI).toBe("http://www.w3.org/1998/Math/MathML");

  });

  it("uses the parent namespace by default", function() {

    var circle = h({ tagName: "circle" });
    var tag = h({ tagName: "svg" }, [circle]);
    var element = tag.render();
    expect(circle.namespace).toBe("http://www.w3.org/2000/svg");
    expect(element.childNodes[0].namespaceURI).toBe("http://www.w3.org/2000/svg");

  });

  describe("toHtml", function() {

    it("renders a select multiple using groups", function() {

      var select = h({ tagName: "select", attrs: { multiple: "multiple", value: ["foo", "bar"] } }, [
        h({tagName: "optgroup", attrs: {label: "foo-group"}}, [
          h({tagName: "option", attrs: {value: "foo"}}, ["foo"])
        ]),
        h({tagName: "optgroup", attrs: {label: "bar-group"}}, [
          h({tagName: "option", attrs: {value: "bar"}}, ["bar"])
        ])
      ]);

      var html = select.toHtml();

      var expected = '<select multiple="multiple">';
      expected += '<optgroup label="foo-group"><option value="foo">foo</option></optgroup>';
      expected += '<optgroup label="bar-group"><option value="bar">bar</option></optgroup>';
      expected += '</select>';

      expect(html).toBe(expected);

    });

    it("renders a select multiple using groups", function() {

      var image = h({ tagName: "input", attrs: { type: "file", multiple: "multiple", capture: "capture", accept: "image/*" } });
      var html = image.toHtml();

      expect(html).toBe('<input type="file" multiple="multiple" capture="capture" accept="image/*">');
    });

    it("renders a style attribute", function() {

      var div = h({ tagName: "div", attrs: { style: {
        border: "1px solid rgb(0, 0, 0)",
        padding: "2px"
      } } });

      var html = div.toHtml();

      expect(html).toBe('<div style="border:1px solid rgb(0, 0, 0);padding:2px"></div>');

    });

    it("ignores textarea value attribute", function() {

      var textarea = h({ tagName: "textarea", attrs: { value: "should be ignored" } });
      var html = textarea.toHtml();
      expect(html).toBe('<textarea></textarea>');

    });

    it("ignores contenteditable value attribute", function() {

      var div = h({ tagName: "div", attrs: { contenteditable: "true", value: "should be ignored" } });
      var html = div.toHtml();
      expect(html).toBe('<div contenteditable="true"></div>');

    });

    it("renders a void element", function() {

      var br = h({ tagName: "br" });
      var html = br.toHtml();
      expect(html).toBe("<br>");

    });

  });

});