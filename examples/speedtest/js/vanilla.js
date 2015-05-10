(function(){

  function Animation(container) {
    this.container = container;
    this.count = 0;
  }

  Animation.prototype.computeStyle = function() {
    return 'top: ' + (Math.sin(this.count / 10) * 10) + 'px; left: ' + (Math.cos(this.count / 10) * 10) + 'px; background: rgb(0,0,' + (this.count % 255) + ');';
  }

  Animation.prototype.createCircles = function() {
    var circle, circles = [];
    for(var i = 0 ; i < benchmark.circles; i++) {
      circle = '<div class="box-view"><div class="box" style="' + this.computeStyle() + '">' + (this.count % 100) + '</div></div>';
      circles.push(circle);
    }
    return circles;
  }

  Animation.prototype.render = function(){
    this.container.innerHTML = this.createCircles().join('');
  }


  window.runVanilla = function() {
    benchmark.reset();

    var animation = new Animation(document.getElementById("grid"));

    benchmark.loop(function() {
      animation.count++;
      animation.render();
    });
  };

})();