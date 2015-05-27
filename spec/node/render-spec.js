var h = require("../helper/h");
var _ = require("../helper/util");

describe("render", function() {

  it("renders text node", function() {

    var node = h("hello").render();
    expect(node.data).toBe("hello");

  });

  it("renders text node inside block node", function() {

    var node = h({ tagName: "span" }, ["hello"]);
    var node = node.render()
    expect(node.tagName).toBe("SPAN");
    expect(node.id).toBeFalsy();
    expect(node.className).toBe('');
    expect(node.childNodes.length).toBe(1);
    expect(node.childNodes[0].data).toBe("hello");

  });

  it("renders div", function() {

    var node = h();
    var node = node.render();
    expect(node.tagName).toBe("DIV");
    expect(node.id).toBeFalsy();
    expect(node.className).toBe('');
    expect(node.childNodes.length).toBe(0);

  });

  it("correctly applies id", function() {

    var node = h({ props: { id: "important" } });
    var node = node.render();
    expect(node.tagName).toBe("DIV");
    expect(node.id).toBe("important");
    expect(node.className).toBe('');
    expect(node.childNodes.length).toBe(0);

  });

  it("correctly applies class name", function() {

    var node = h({ props: { className: "pretty" } });
    var node = node.render();
    expect(node.tagName).toBe("DIV");
    expect(node.id).toBeFalsy();
    expect(node.className).toBe('pretty');
    expect(node.childNodes.length).toBe(0);

  });

  it("correctly applies mixture of node/classname", function() {

    var node = h({ props: { id: "important", className: "very pretty" } });
    var node = node.render();
    expect(node.tagName).toBe("DIV");
    expect(node.id).toBe("important");
    expect(node.className).toBe('very pretty');
    expect(node.childNodes.length).toBe(0);

  });

  it("correctly applies style", function() {

    var node = h({
      props: {
        id: "important",
        className: "pretty"
      },
      attrs: {
        style: {
          border: "1px solid rgb(0, 0, 0)",
          padding: "2px"
        }
      }
    });
    var node = node.render();
    expect(node.tagName).toBe("DIV");
    expect(node.id).toBe("important");
    expect(node.className).toBe('pretty');
    expect(node.childNodes.length).toBe(0);
    expect(node.style.border).toBe(_.style("border", "1px solid rgb(0, 0, 0)"));
    expect(node.style.padding).toBe(_.style("padding", "2px"));

  });

  it("correcly adds children", function() {

    var node = h({}, [
      h({}, [
        "just testing",
        "multiple",
        h({ tagName: "b" }, ["nodes"])
      ]),
      "hello",
      h({ tagName: "span" }, ["test"])
    ]);

    var node = node.render();

    expect(node.childNodes.length).toBe(3);

    var nodes = node.childNodes;
    expect(nodes.length).toBe(3);
    expect(nodes[0].tagName).toBe("DIV");
    expect(nodes[1].data).toBe("hello");
    expect(nodes[2].tagName).toBe("SPAN");

    var subNodes0 = nodes[0].childNodes;
    expect(subNodes0.length).toBe(3);
    expect(subNodes0[0].data).toBe("just testing");
    expect(subNodes0[1].data).toBe("multiple");
    expect(subNodes0[2].tagName).toBe("B");

    var subNodes0_2 = subNodes0[2].childNodes;
    expect(subNodes0_2.length).toBe(1);
    expect(subNodes0_2[0].data).toBe("nodes");

    var subNodes2 = nodes[2].childNodes;
    expect(subNodes2.length).toBe(1);
    expect(subNodes2[0].data).toBe("test");

  })

  it("ignores incompatible children", function() {

    var node = h({
      props: {
        id: "important",
        className: "pretty"
      },
      attrs: {
        style: {
          "cssText": "color: red;"
        }
      }
    }, [
      null
    ]);

    var node = node.render();

    expect(node.tagName).toBe("DIV");
    expect(node.id).toBe("important");
    expect(node.className).toBe('pretty');
    expect(node.childNodes.length).toBe(0);
    expect(node.style.cssText).toBe(_.style("cssText", "color: red;"));

  });

  it("respects namespace", function() {

    var svgURI = "http://www.w3.org/2000/svgcustom";
    var node = h({ tagName: "svg", attrs: { xmlns: svgURI } });
    var element = node.render();

    expect(element.tagName.toLowerCase()).toBe("svg");
    expect(element.namespaceURI).toBe(svgURI);

  });

  it("respects type extension", function() {

    var MegaButton = document.registerElement('mega-button', {
      prototype: Object.create(HTMLButtonElement.prototype),
      extends: 'button'
    });

    var node = h({ tagName: "button" , attrs: { is: "mega-button" } });
    var element = node.render();

    expect(element instanceof MegaButton).toBe(true);

  });

  it("checks that `domLayerNode` is correctly set when `events` is defined", function() {

    var node = h({ events: { "onclick": function() {} } });
    var element = node.render();
    expect(element.domLayerNode).toBe(node);

  });

});