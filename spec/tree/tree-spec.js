var h = require("../helper/h");
var _ = require("../helper/util");
var Tree = require("../../tree/tree");

describe("Tree", function() {

  var tree;

  beforeEach(function() {
    document.body.innerHTML = '<div id="mount-point"></div>';
    tree = new Tree();
  })

  afterEach(function() {
    document.body.innerHTML = '';
  });


  it("mounts a virtual tree", function() {

    var mountId = tree.mount("#mount-point", h({}, ["#1", "#2", "#3"]));
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");
    expect(mountPoint.domLayerTreeId).toBe(mountId);

  });

  it("mounts a factory", function() {

    var mountId = tree.mount("#mount-point", function() { return h({}, ["#1", "#2", "#3"]); });
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");

  });

  it("unmounts a virtual tree", function() {

    var mountId = tree.mount("#mount-point", h({}, ["#1", "#2", "#3"]));
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");

    tree.unmount("#mount-point");
    expect(mountPoint.textContent).toBe("");
    expect(mountPoint.domLayerTreeId).toBe(undefined);

  });

  it("updates a mounted tree", function() {

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

    component.order = "desc";
    tree.update(mountId);
    expect(mountPoint.textContent).toBe("#3#2#1");

  });

  it("updates all mounted trees", function() {

    document.body.innerHTML = '<div id="mount-point"></div><div id="mount-point2"></div>';

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

  it("ignores updates with invalid id", function() {

    tree.update("invalid_id");

  });

  it("returns the definition of a mount", function() {

    var children = h({}, ["#1", "#2", "#3"]);
    var mountId = tree.mount("#mount-point", children, { custom: "custom" });
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");

    var mounted = tree.mounted(mountId);

    expect(mounted.container).toBe(mountPoint);
    expect(mounted.factory).toBe(children);
    expect(mounted.custom).toBe("custom");

  });

  it("returns the definition of all mounts", function() {

    var children = h({}, ["#1", "#2", "#3"]);
    var mountId = tree.mount("#mount-point", children, { custom: "custom" });
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");

    var mounted = tree.mounted();

    expect(mounted[mountId].container).toBe(mountPoint);
    expect(mounted[mountId].factory).toBe(children);
    expect(mounted[mountId].custom).toBe("custom");

  });


});
