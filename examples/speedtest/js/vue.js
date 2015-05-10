(function(){
  var Animation = Vue.extend({
    template: '<div v-repeat="num" class="box-view"><div class="box" v-style="style">{{content}}</div></div>',
    data: function() {
      return {
        num: benchmark.circles,
        count: 0
      }
    },
    computed: {
      style: function () {
        var count = this.count;
        return 'top:' + (Math.sin(count / 10) * 10) + 'px;' + 'left:' + (Math.cos(count / 10) * 10) + 'px;' + 'background-color: rgb(0,0,' + (count % 255) + ')'
      },
      content: function() {
        return this.count % 100 + '';
      }
    }
  });

  window.runVue = function() {
    benchmark.reset();
    var animation = new Animation();
    animation.$mount("#grid");

    benchmark.loop(function() {
      animation.count++;
    });
  };

})();