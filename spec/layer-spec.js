var h = require("./helper/h");
var _ = require("./helper/util");
var Layer = require("..");

describe("Layer", function() {

  var layer;

  beforeEach(function() {
    document.body.innerHTML = '<div id="mount-point"></div>';
    layer = new Layer();
  })

  afterEach(function() {
    document.body.innerHTML = '';
  });


  it("mounts a virtual tree", function() {

    var mountId = layer.mount("#mount-point", h({}, ["#1", "#2", "#3"]));
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");
    expect(mountPoint.domLayerId).toBe(mountId);

  });

  it("mounts a factory", function() {

    var mountId = layer.mount("#mount-point", function() { return h({}, ["#1", "#2", "#3"]); });
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");

  });

  it("unmounts a virtual tree", function() {

    var mountId = layer.mount("#mount-point", h({}, ["#1", "#2", "#3"]));
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");

    layer.unmount("#mount-point");
    expect(mountPoint.textContent).toBe("");
    expect(mountPoint.domLayerId).toBe(undefined);

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

    var component = new Component;

    var mountId = layer.mount("#mount-point", component.render.bind(component));
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");

    component.order = "desc";
    layer.update(mountId);
    expect(mountPoint.textContent).toBe("#3#2#1");

  });

  it("ignores updates with invalid id", function() {

    layer.update("invalid_id");

  });

  it("returns the definition of a mount", function() {

    var children = h({}, ["#1", "#2", "#3"]);
    var mountId = layer.mount("#mount-point", children, { custom: "custom" });
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");

    var mounted = layer.mounted(mountId);

    expect(mounted.container).toBe(mountPoint);
    expect(mounted.factory).toBe(children);
    expect(mounted.inSvg).toBe(false);
    expect(mounted.custom).toBe("custom");

  });

  it("returns the definition of all mounts", function() {

    var children = h({}, ["#1", "#2", "#3"]);
    var mountId = layer.mount("#mount-point", children, { custom: "custom" });
    var mountPoint = document.getElementById("mount-point");
    expect(mountPoint.textContent).toBe("#1#2#3");

    var mounted = layer.mounted();

    expect(mounted[mountId].container).toBe(mountPoint);
    expect(mounted[mountId].factory).toBe(children);
    expect(mounted[mountId].inSvg).toBe(false);
    expect(mounted[mountId].custom).toBe("custom");

  });


});
