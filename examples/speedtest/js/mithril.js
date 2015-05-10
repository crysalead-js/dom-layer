(function() {
  var animation = {};

  animation.controller = function() {
    this.count = 0;
  };

  animation.view = function(ctrl) {

    function getStyle(ctrl) {
      var count = ctrl.count;
      return {
        top: (Math.sin(count / 10) * 10) + "px",
        left: (Math.cos(count / 10) * 10) + "px",
        background: "rgb(0,0," + (count % 255) +")"
      };
    }

    function createCircles(ctrl) {
      var circles = [];
      for(var i = 0 ; i < benchmark.circles; i++) {
        circles.push({
            tag: "div", attrs: {className: "box-view"}, children: [{
              tag: "div", attrs: { className: "box" , style: getStyle(ctrl) }, children: ctrl.count % 100 + ''
            }]
          }
        );
      }
      return circles;
    }
    return createCircles(ctrl);
  };

  window.runMithril = function () {
    benchmark.reset();
    var ctrl = m.mount(document.getElementById('grid'), animation);
    benchmark.loop(function() {
      ctrl.count++;
      m.redraw();
    });
  };
})();