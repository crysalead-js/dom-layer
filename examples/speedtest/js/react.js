(function(){

  var Animation = React.createClass({

    getInitialState: function() {
      return { count: 0 };
    },

    update: function() {
      this.setState({ count: this.state.count + 1 });
    },

    render: function() {
      var count = this.state.count;
      var circle, circles = [];
      for (var i = 0 ; i < benchmark.circles; i++) {
        circles.push(
          React.DOM.div(
            { className: "box-view", key: i },
            React.DOM.div({
              className: "box",

              style: {
                top: Math.sin(count / 10) * 10,
                left: Math.cos(count / 10) * 10,
                background: 'rgb(0, 0,' + count % 255 + ')'
              }
            }, count % 100)
          )
        );
      }
      return React.DOM.div(null, circles);  // React require a unique root element
    }
  });

  window.runReact = function() {
    benchmark.reset();

    var animation = React.render(
      React.createElement(Animation),
      document.getElementById('grid')
    );

    benchmark.loop(function() {
      animation.update();
    });
  };

})();