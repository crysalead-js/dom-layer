var h = require("../helper/h");
var Tag = require("../../src/node/tag");
var Tree = require("../../src/tree/tree");

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
    expect(tag.hooks).toBe(undefined);
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
    expect(tag.children[0].data).toBe("child1");
    expect(tag.children[1].data).toBe("child2");

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

  it("sets the `hooks` property", function() {

    var hooks = {};
    var tag = h({ hooks: hooks });
    expect(tag.hooks).toBe(hooks);

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

  describe('with `"hooks"` defined', function() {

    var testBody, tree, mountPoint;

    beforeEach(function() {
      testBody = document.getElementById("test");
      testBody.innerHTML = '<div id="mount-point"></div>';
      mountPoint = document.getElementById("mount-point");
      tree = new Tree();
    })

    afterEach(function() {
      testBody.innerHTML = '';
    });

    it('calls the `"created"` callback on creation', function() {

      var params;

      var tag = h({ hooks: { created : function() {
        params = Array.prototype.slice.call(arguments);
      } } });

      var element = tag.render();

      expect(params).toEqual([tag, element]);

    });

    it('calls the `"created"` callback on attachement', function() {

      var params;

      var tag = h({ hooks: { created : function() {
        params = Array.prototype.slice.call(arguments);
      } } });

      var element = tag.attach(document.createElement("div"));

      expect(params).toEqual([tag, element]);

    });

    it('calls the `"updated"` callback on update', function() {

      var params = [];
      var hooks = { updated : function() {
        params.push(Array.prototype.slice.call(arguments));
      } };

      var from = h({ hooks: hooks });
      var element = from.render();

      var to1 = h({ hooks: hooks });
      from.patch(to1);

      var to2 = h({ hooks: hooks });
      to1.patch(to2);

      expect(params).toEqual([[to1, element], [to2, element]]);

    });

    it('calls the `"remove"` & `"destroy"` callback on remove', function() {

      var destroyCallback;
      var params = [];

      var tag = h({ hooks: {
          remove : function() {
            params.push(Array.prototype.slice.call(arguments));
          },
          destroy : function(element, callback) {
            destroyCallback = callback;
            params.push([element, destroyCallback]);
          }
        }
      });

      var mountId = tree.mount("#mount-point", tag);
      tree.unmount(mountId);

      expect(mountPoint.innerHTML).toBe("<div></div>");
      expect(params).toEqual([[tag, tag.element], [tag.element, destroyCallback]]);

      destroyCallback();
      expect(mountPoint.innerHTML).toBe("");

    });

    it('calls `"remove"` on children first', function() {

      var logs = [];

      var tag = h({ hooks: {
          remove : function() {
            logs.push('parent removed last');
          }
        }
      }, [
        h({ hooks: {
            remove : function() {
              logs.push('child removed first');
            }
          }
        })
      ]);

      var mountId = tree.mount("#mount-point", tag);
      tree.unmount(mountId);

      expect(logs).toEqual(['child removed first', 'parent removed last']);

    });

  });

  describe(".destroy()", function() {

    it("silently aborts if the tag hasn't been rendered", function() {

      var tag = h();
      expect(tag.destroy()).toBe(undefined);

    });

    it("destroys a tag", function() {

      var tag = h();
      var element = tag.render();
      var fragment = element.parentNode;
      expect(tag.destroy()).toBe(element);
      expect(fragment.hasChildNodes()).toBe(false);

    });

  });

  describe(".toHtml()", function() {

    it("renders a select", function() {

      var select = h({ tagName: "select", attrs: { value: "bar" } }, [
        h({tagName: "option", attrs: {value: "foo"}}, ["foo"]),
        h({tagName: "option", attrs: {value: "bar"}}, ["bar"])
      ]);

      var html = select.toHtml();

      var expected = '<select>';
      expected += '<option value="foo">foo</option>';
      expected += '<option value="bar" selected="selected">bar</option>';
      expected += '</select>';

      expect(html).toBe(expected);

    });

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
      expected += '<optgroup label="foo-group"><option value="foo" selected="selected">foo</option></optgroup>';
      expected += '<optgroup label="bar-group"><option value="bar" selected="selected">bar</option></optgroup>';
      expected += '</select>';

      expect(html).toBe(expected);

    });

    it("renders a select multiple using groups", function() {

      var image = h({ tagName: "input", attrs: { type: "file", multiple: "multiple", capture: "capture", accept: "image/*" } });
      var html = image.toHtml();

      expect(html).toBe('<input type="file" multiple="multiple" capture="capture" accept="image/*">');
    });

    it('renders a `"style"` attribute using an string', function() {

      var div = h({ tagName: "div", attrs: { style: "border:1px solid rgb(0, 0, 0);padding:2px" } });
      var html = div.toHtml();

      expect(html).toBe('<div style="border:1px solid rgb(0, 0, 0);padding:2px"></div>');

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

    it("casts rendered attributes to string value", function() {

      var checkbox = h({ tagName: "input", attrs: { type: "checkbox", value: true } });
      var html = checkbox.toHtml();
      expect(html).toBe('<input type="checkbox" value="true">');

    });

    it("doesn't ignore textarea value attribute", function() {

      var textarea = h({ tagName: "textarea", attrs: { value: "should not be ignored" } });
      var html = textarea.toHtml();
      expect(html).toBe('<textarea>should not be ignored</textarea>');

    });

    it("doesn't ignore contenteditable value attribute", function() {

      var div = h({ tagName: "div", attrs: { contenteditable: "true", value: "should not be ignored" } });
      var html = div.toHtml();
      expect(html).toBe('<div contenteditable="true">should not be ignored</div>');

    });

    it('renders the `innerHTML` property if present and no children has been defined', function () {

      var div = h({ tagName: "div", props: { innerHTML: '<span>Hello World</span>' }});
      var html = div.toHtml();
      expect(html).toBe('<div><span>Hello World</span></div>');

    });

    it("renders a void element", function() {

      var br = h({ tagName: "br" });
      var html = br.toHtml();
      expect(html).toBe("<br>");

    });

    it("ignores null elements", function() {

      var br = h({ tagName: "div" }, ["child1", null, "child2"]);
      var html = br.toHtml();
      expect(html).toBe("<div>child1child2</div>");

    });

  });

});