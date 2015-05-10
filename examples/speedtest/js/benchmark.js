(function(){

  function Benchmark() {}

  Benchmark.circles = 500; // Change N to change the number of drawn circles.

  var timeout = null;
  var totalTime = null;
  var loopCount = null;
  var startDate = null;

  Benchmark.reset = function() {
    clearTimeout(timeout);
    document.getElementById('grid').innerHTML = '';
    document.getElementById('timing').innerHTML = '&nbsp;';
  };

  Benchmark.loop = function(fn) {
    loopCount = 0;
    totalTime = 0;
    startDate = Date.now();
    Benchmark._loop(fn);
  };

  Benchmark._loop = function(fn) {
    totalTime += Date.now() - startDate;
    startDate = Date.now();
    fn();
    loopCount++;
    if (loopCount % 20 === 0) {
        $('#timing').text('Performed ' + loopCount + ' iterations in ' + totalTime + ' ms (average ' + (totalTime / loopCount).toFixed(2) + ' ms per loop).');
    }
    timeout = _.defer(Benchmark._loop, fn);
  };

  window.benchmark = Benchmark;

})()