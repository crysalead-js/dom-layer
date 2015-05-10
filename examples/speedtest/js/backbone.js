(function(){

  var Circle = Backbone.Model.extend({

    defaults: {
      style: "",
      content: 0
    },

    initialize: function() {
      this.count = 0;
    },

    computeStyle: function() {
      return 'top: ' + (Math.sin(this.count / 10) * 10) + 'px; left: ' + (Math.cos(this.count / 10) * 10) + 'px; background: rgb(0,0,' + (this.count % 255) + ');';
    },

    tick: function() {
      this.count++;
      this.set({
        style: this.computeStyle(),
        content: this.count % 100
      });
    }

  });

  var CircleView = Backbone.View.extend({

    className: 'box-view',

    template: _.template('<div class="box" style="<%= style %>"><%= content %></div>'),

    initialize: function() {
      this.model.bind('change', this.render, this);
    },

    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    }

  });

  window.runBackbone = function() {
    benchmark.reset();

    var box = new Circle({number: 0});
    _.map(_.range(benchmark.circles), function() {
      var view = new CircleView({model: box});
      $('#grid').append(view.render().el);
    });

    benchmark.loop(box.tick.bind(box));
  };

})();
