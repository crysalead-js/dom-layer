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
    expect(tag.props).toBe(undefined);
    expect(tag.attrs).toBe(undefined);
    expect(tag.attrsNS).toBe(undefined);
    expect(tag.events).toBe(undefined);
    expect(tag.callbacks).toBe(undefined);
    expect(tag.data).toBe(undefined);
    expect(tag.element).toBe(undefined);
    expect(tag.parent).toBe(undefined);
    expect(tag.key).toBe(undefined);
    expect(tag.namespace).toBe(null);
    expect(tag.is).toBe(null);

  });

  it("sets the `tagName` property", function() {

    var tag = h({ tagName: "span" });
    expect(tag.tagName).toBe("span");

  });

  it("sets the `children` property", function() {

    var tag = h({}, ["child1", "child2"]);
    expect(tag.children.length).toBe(2);
    expect(tag.children[0].text).toBe("child1");
    expect(tag.children[1].text).toBe("child2");

  });

  it("sets the `props` property", function() {

    var props = {};
    var tag = h({ props: props });
    expect(tag.props).toBe(props);

  });

  it("sets the `attrs` property", function() {

    var attrs = {};
    var tag = h({ attrs: attrs });
    expect(tag.attrs).toBe(attrs);

  });

  it("sets the `attrsNS` property", function() {

    var attrsNS = {};
    var tag = h({ attrsNS: attrsNS });
    expect(tag.attrsNS).toBe(attrsNS);

  });

  it("sets the `events` property", function() {

    var events = {};
    var tag = h({ events: events });
    expect(tag.events).toBe(events);

  });

  it("sets the `callbacks` property", function() {

    var callbacks = {};
    var tag = h({ callbacks: callbacks });
    expect(tag.callbacks).toBe(callbacks);

  });

  it("sets the `data` property", function() {

    var data = {};
    var tag = h({ data: data });
    expect(tag.data).toBe(data);

  });

  it("sets the `key` property", function() {

    var tag = h({ key: "10" });
    expect(tag.key).toBe("10");

  });

  it("sets the namespace", function() {

    var tag = h({ tagName: "circle", attrs : { xmlns: "http://www.w3.org/2000/svg" } });
    expect(tag.namespace).toBe("http://www.w3.org/2000/svg");

  });

  it("sets the type extension", function() {

    var tag = h({ tagName: "button", attrs : { is: "mega-button" } });
    expect(tag.is).toBe("mega-button");

  });

  it("sets SVG as default namespace for <svg>", function() {

    var tag = h({ tagName: "svg" });
    var element = tag.render();
    expect(tag.namespace).toBe("http://www.w3.org/2000/svg");
    expect(element.namespaceURI).toBe("http://www.w3.org/2000/svg");

  });

  it("sets MathML as default namespace for <math>", function() {

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

    it('renders a `"style"` attribute using an object', function() {

      var div = h({ tagName: "div", attrs: { style: {
        border: "1px solid rgb(0, 0, 0)",
        padding: "2px"
      } } });

      var html = div.toHtml();

      expect(html).toBe('<div style="border:1px solid rgb(0, 0, 0);padding:2px"></div>');

    });

    it('renders a `"class"` attribute using an object', function() {

      var div = h({ tagName: "div", attrs: { "class": {
        active1: true,
        inavtive: false,
        active2: true
      } } });

      var html = div.toHtml();

      expect(html).toBe('<div class="active1 active2"></div>');

    });

    it("renders namespaced attributes", function() {

      var div = h({
        tagName: "image",
        attrs: {
          xmlns: "http://www.w3.org/2000/svg"
        },
        attrsNS: {
          "xlink:href": "test.jpg"
        }
      });

      var html = div.toHtml();

      expect(html).toBe('<image xmlns="http://www.w3.org/2000/svg" xlink:href="test.jpg"></image>');

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