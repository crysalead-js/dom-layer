(function(){

  var Circle = Ember.Object.extend({

    top: 0,
    left: 0,
    content: 0,
    count: 0,

    computeStyle: function() {
      var count = this.get('count');
      return 'top: ' + (Math.sin(count / 10) * 10) + 'px; left: ' + (Math.cos(count / 10) * 10) + 'px; background: rgb(0,0,' + (count % 255) + ');';
    },

    tick: function() {
      var count = this.get('count') + 1;
      this.set('count', count);
      this.set('content', count % 100);
      this.set('style', this.computeStyle());
    }

  });

  var htmlbarsTemplate = Ember.HTMLBars.compile('<div class="box" style="{{style}}"> {{content}}</div>');

  var CircleView = Ember.View.extend({
    usingHTMLBars: true,
    template: htmlbarsTemplate,
    classNames: ['box-view']
  });

  window.runEmber = function() {
    benchmark.reset();

    var box = Circle.create();
    _.map(_.range(benchmark.circles), function() {
      var view = CircleView.create({context: box});
      view.appendTo('#grid');
    });

    benchmark.loop(box.tick.bind(box));
  };

})();