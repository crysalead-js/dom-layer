(function(){

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
      circles.push({
        tag: 'div', className: "box-view", children: [{
          tag: "div", className: "box", style: this.getStyle(), children: (this.count % 100) + ''
        }]
      })
    }
    return circles;
  }

  Animation.prototype.render = function() {
    return this.createCircles();
  }

  window.runBobril = function() {
    benchmark.reset();

    var animation = new Animation();
    b.init(animation.render.bind(animation), document.getElementById('grid'));

    benchmark.loop(function() {
      animation.count++;
      b.invalidate();
    });
  };

})();
