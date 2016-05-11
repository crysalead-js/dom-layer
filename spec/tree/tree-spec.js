var h = require("../helper/h");
var _ = require("../helper/util");
var Tree = require("../../src/tree/tree");

describe("Tree", function() {

  var testBody, tree, mountPoint, parentNode;

  beforeEach(function() {
    testBody = document.getElementById("test");
    testBody.innerHTML = '<div id="mount-point"></div>';
    mountPoint = document.getElementById("mount-point");
    parentNode = mountPoint.parentNode;
    tree = new Tree();
  })

  afterEach(function() {
    testBody.innerHTML = '';
  });


  describe(".mount()", function() {

    it("mounts a virtual tree", function() {

      var mountId = tree.mount("#mount-point", h({}, ["#1", "#2", "#3"]));
      expect(mountPoint.textContent).toBe("#1#2#3");
      expect(mountPoint.domLayerTreeId).toBe(mountId);

    });

    it("mounts in a transcluded way", function() {

      var mountId = tree.mount("#mount-point", function() { return h({}, ["#1", "#2", "#3"]); } , {
        transclude: true
      });
      expect(mountPoint.parentNode).toBe(null);
      expect(mountPoint.textContent).toBe("");
      expect(parentNode.textContent).toBe("#1#2#3");

    });

    it("mounts a virtual tree using a custom UUID identifier", function() {

      var bookedId = tree.uuid();
      var mountId = tree.mount("#mount-point", h({}, ["#1", "#2", "#3"]), { mountId: bookedId });

      expect(mountPoint.textContent).toBe("#1#2#3");
      expect(mountPoint.domLayerTreeId).toBe(mountId);
      expect(bookedId).toBe(mountId);

    });

    it("mounts a factory", function() {

      var mountId = tree.mount("#mount-point", function() { return h({}, ["#1", "#2", "#3"]); });
      expect(mountPoint.textContent).toBe("#1#2#3");

    });

    it("auto unmounts a already mounted virtual tree on mount", function() {

      var mountId1 = tree.mount("#mount-point", h({}, ["#1", "#2", "#3"]));
      expect(mountPoint.textContent).toBe("#1#2#3");
      expect(mountPoint.domLayerTreeId).toBe(mountId1);

      var mountId2 = tree.mount("#mount-point", h({}, ["#4", "#5", "#6"]));
      expect(mountPoint.textContent).toBe("#4#5#6");
      expect(mountPoint.domLayerTreeId).toBe(mountId2);

      expect(Object.keys(tree.mounted())).toEqual([mountId2]);

    });

    it("throw an error when trying to transclude unsing a non unique DOM element", function() {

      var closure = function() {
        var mountId = tree.mount('#mount-point', function() { return [h({}, ['#1']), h({}, ['#2'])]; } , {
          transclude: true
        });
      };

      expect(closure).toThrow(new Error('Transclusion requires a single DOMElement to transclude.'));

    });

    it("throw an error when trying to use a selector which doesn't identify a unique DOM element", function() {

      testBody.innerHTML = '<div class="mount-point"></div><div class="mount-point"></div>';

      var closure = function() {
        tree.mount(".mount-point", h());
      };
      expect(closure).toThrow(new Error("The selector must identify an unique DOM element"));

    });

  });

  describe(".attach()", function() {

    it("attaches a previously rendered html using a function", function() {

      testBody.innerHTML = '<div id="mount-point"><button>Click me!</button></div>';

      var from = function() {
        return h({ tagName: "button", events: { onclick: onclick} }, ["Click me!"]);
      };
      var mountId = tree.attach("#mount-point", from);
      var mountPoint = document.getElementById("mount-point");

      expect(mountPoint.innerHTML).toBe("<button>Click me!</button>");
      expect(mountPoint.domLayerTreeId).toBe(mountId);

      var mount = tree.mounted(mountId);
      expect(mount.children[0].element).toBe(mountPoint.childNodes[0]);
      expect(mount.children[0].element.textContent).toBe("Click me!");

    });

    it("populates domLayerNode when `events` is set", function() {

      testBody.innerHTML = '<div id="mount-point"><button>Click me!</button></div>';

      var onclick = function () {};
      var from = h({ tagName: "button", events: { onclick: onclick} }, ["Click me!"]);
      var mountId = tree.attach("#mount-point", from);
      var mountPoint = document.getElementById("mount-point");

      expect(mountPoint.innerHTML).toBe("<button>Click me!</button>");
      expect(mountPoint.domLayerTreeId).toBe(mountId);

      expect(from.element).toBe(mountPoint.childNodes[0]);
      expect(from.element.textContent).toBe("Click me!");
      expect(from.element.domLayerNode).toBe(from);
      expect(from.element.domLayerNode.events.onclick).toBe(onclick);

    });

    it("manages the consecutive textual nodes edge case", function() {

      testBody.innerHTML = '<div id="mount-point"><div>#1#2#3</div></div>';

      var from = h({}, ["#1", "#2", "#3"]);
      var mountId = tree.attach("#mount-point", from);
      var mountPoint = document.getElementById("mount-point");

      expect(mountPoint.textContent).toBe("#1#2#3");
      expect(mountPoint.domLayerTreeId).toBe(mountId);

      expect(from.element).toBe(mountPoint.childNodes[0]);

      var children = from.children;
      var childNodes = mountPoint.childNodes;

      expect(children[0].element).toBe(childNodes[0].childNodes[0]);
      expect(children[0].element.textContent).toBe("#1#2#3");
      expect(children[0].data).toBe("#1#2#3");
      expect(children[1].data).toBe("");
      expect(children[2].data).toBe("");

    });

    it("throw an error when trying to use a selector which doesn't identify a unique DOM element", function() {

      testBody.innerHTML = '<div class="mount-point"></div><div class="mount-point"></div>';

      var closure = function() {
        tree.attach(".mount-point", h());
      };
      expect(closure).toThrow(new Error("The selector must identify an unique DOM element"));

    });

    it("ignores `null` virtual nodes", function() {

      testBody.innerHTML = '<div id="mount-point"><button>Click me!</button></div>';

      var from = h({ tagName: "button", events: { onclick: onclick} }, [null, "Click me!", null]);
      var mountId = tree.attach("#mount-point", from);
      var mountPoint = document.getElementById("mount-point");

      expect(mountPoint.innerHTML).toBe("<button>Click me!</button>");
      expect(mountPoint.domLayerTreeId).toBe(mountId);

      var mount = tree.mounted(mountId);
      expect(mount.children[0].element).toBe(mountPoint.childNodes[0]);
      expect(mount.children[0].element.textContent).toBe("Click me!");

    });

  });

  describe(".umount()", function() {

    it("unmounts a virtual tree", function() {

      var mountId = tree.mount("#mount-point", h({}, ["#1", "#2", "#3"]));
      expect(mountPoint.textContent).toBe("#1#2#3");

      tree.unmount(mountId);
      expect(mountPoint.textContent).toBe("");
      expect(mountPoint.domLayerTreeId).toBe(undefined);

    });

    it("umounts a transcluded mount", function() {

      var mountId = tree.mount("#mount-point", function() { return h({}, ["#1", "#2", "#3"]); } , {
        transclude: true
      });
      tree.unmount(mountId);

      expect(mountPoint.parentNode).toBe(parentNode);
      expect(mountPoint.textContent).toBe("");
      expect(mountPoint.domLayerTreeId).toBe(undefined);

    });

    it("unmounts all virtual trees", function() {

      var mountId = tree.mount("#mount-point", h({}, ["#1", "#2", "#3"]));
      expect(mountPoint.textContent).toBe("#1#2#3");

      tree.unmount();
      expect(mountPoint.textContent).toBe("");
      expect(mountPoint.domLayerTreeId).toBe(undefined);

    });

    it("bails out with an invalid mount id", function() {

      var mountId = tree.mount("#mount-point", h({}, ["#1", "#2", "#3"]));
      expect(mountPoint.textContent).toBe("#1#2#3");

      tree.unmount("abc");
      expect(mountPoint.textContent).toBe("#1#2#3");
      expect(mountPoint.domLayerTreeId).toBe(mountId);

    });

  });

  describe(".update()", function() {

    it("updates a mounted tree", function() {

      testBody.innerHTML = '<div id="mount-point"></div>';

      var mountId = tree.mount("#mount-point", h({ tagName: "div" }, ['from']));
      tree.update(mountId, h({ tagName: "span" }, ['to']));

      var mountPoint = document.getElementById("mount-point");
      expect(mountPoint.textContent).toBe("to");

    });

    it("updates a mounted tree using a factory", function() {

      function Component() {
        this.order = "asc";
      }
      Component.prototype.render = function() {
        var children = ["#1", "#2", "#3"];
        if (this.order !== "asc") {
          children.reverse();
        }
        return h({}, children);
      };

      var component = new Component();

      var mountId = tree.mount("#mount-point", component.render.bind(component));
      expect(mountPoint.textContent).toBe("#1#2#3");

      component.order = "desc";
      tree.update(mountId);
      expect(mountPoint.textContent).toBe("#3#2#1");

    });

    it("updates all mounted trees", function() {

      testBody.innerHTML = '<div id="mount-point"></div><div id="mount-point2"></div>';

      function Component() {
        this.order = "asc";
      }
      Component.prototype.render = function() {
        var children = ["#1", "#2", "#3"];
        if (this.order !== "asc") {
          children.reverse();
        }
        return h({}, children);
      };

      var component = new Component();

      var mountId = tree.mount("#mount-point", component.render.bind(component));
      var mountPoint = document.getElementById("mount-point");
      expect(mountPoint.textContent).toBe("#1#2#3");

      var component2 = new Component();

      var mountId2 = tree.mount("#mount-point2", component2.render.bind(component2));
      var mountPoint2 = document.getElementById("mount-point2");
      expect(mountPoint2.textContent).toBe("#1#2#3");

      component.order = "desc";
      component2.order = "desc";

      tree.update();
      expect(mountPoint.textContent).toBe("#3#2#1");
      expect(mountPoint2.textContent).toBe("#3#2#1");

    });

    it('maintains focus', function () {

      var from = [
        h({ tagName: 'input', key: 0, attrs: { id: "input1" } }),
        h({ tagName: 'input', key: 1, attrs: { id: "input2" } }),
        h({ tagName: 'input', key: 2, attrs: { id: "input3" } }),
        h({ tagName: 'input', key: 3, attrs: { id: "input4" } })
      ];

      var to = [
        h({ tagName: 'input', key: 1, attrs: { id: "input2" } }),
        h({ tagName: 'input', key: 2, attrs: { id: "input3" } }),
        h({ tagName: 'input', key: 3, attrs: { id: "input4" } }),
        h({ tagName: 'input', key: 0, attrs: { id: "input1" } })
      ];

      var mountId = tree.mount("#mount-point", from);

      var input = document.getElementById("input1");

      input.focus();

      expect(input).toBe(document.activeElement);

      tree.update(mountId, to);

      expect(input).toBe(document.activeElement);

    });

    it("ignores updates with invalid id", function() {

      expect(tree.update("invalid_id")).toBe(undefined);

    });

  });

  describe(".mounted()", function() {

    it("returns the definition of a mount", function() {

      var children = h({}, ["#1", "#2", "#3"]);
      var mountId = tree.mount("#mount-point", children, { custom: "custom" });
      expect(mountPoint.textContent).toBe("#1#2#3");

      var mounted = tree.mounted(mountId);

      expect(mounted.container).toBe(mountPoint);
      expect(mounted.factory).toBe(children);
      expect(mounted.custom).toBe("custom");

    });

    it("returns the definition of all mounts", function() {

      var children = h({}, ["#1", "#2", "#3"]);
      var mountId = tree.mount("#mount-point", children, { custom: "custom" });
      expect(mountPoint.textContent).toBe("#1#2#3");

      var mounted = tree.mounted();

      expect(mounted[mountId].container).toBe(mountPoint);
      expect(mounted[mountId].factory).toBe(children);
      expect(mounted[mountId].custom).toBe("custom");

    });

  });

});
