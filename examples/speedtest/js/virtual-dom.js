(function(){

  var h = virtualDom.h;
  var create = virtualDom.create;
  var diff = virtualDom.diff;
  var patch = virtualDom.patch;

  function Animation() {
    this.count = 0;
  }

  Animation.prototype.getStyle = function() {
    return {
      top: (Math.sin(this.count / 10) * 10) + "px",
      left: (Math.cos(this.count / 10) * 10) + "px",
      background: "rgb(0,0," + (this.count % 255) +")"
    };
  }

  Animation.prototype.createCircles = function() {
    var circles = [];
    for(var i = 0 ; i < benchmark.circles; i++) {
      circles.push(
        h("div", { attributes: {"class": "box-view"} }, [
          h("div", { attributes: {"class": "box" }, style: this.getStyle() }, [this.count % 100 + ''])
        ])
      );
    }
    return h("div", circles); // virtual dom require a unique root element
  }

  Animation.prototype.render = function() {
    return this.createCircles();
  }

  window.runVirtualDom = function() {
    benchmark.reset();

    var animation = new Animation();

    var tree = animation.render();
    var rootNode = create(tree);
    document.getElementById("grid").appendChild(rootNode);

    benchmark.loop(function() {
      animation.count++;
      var newTree = animation.render();
      var patches = diff(tree, newTree);
      rootNode = patch(rootNode, patches);
    });
  };

})();
