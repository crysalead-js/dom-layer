(function(){

  var Tree = domLayer.Tree;
  var Tag = domLayer.Tag;
  var Text = domLayer.Text;

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
        new Tag("div", { attrs: {"class": "box-view"} }, [
          new Tag("div", { attrs: {"class": "box", style: this.getStyle() } }, [
            new Text(this.count % 100 + '')
          ])
        ])
      );
    }
    return circles;
  }

  Animation.prototype.render = function() {
    return this.createCircles();
  }

  var tree = new Tree();

  window.runDomLayer = function() {
    benchmark.reset();
    tree.unmount();

    var animation = new Animation();
    var id = tree.mount("#grid", animation.render.bind(animation));

    benchmark.loop(function() {
      animation.count++;
      tree.update(id);
    });
  };

})();
