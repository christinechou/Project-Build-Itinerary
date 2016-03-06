// Helper functions
  var each = function(array, iteration) {
    if (!array) {alert("array reference missing")}
    for (var i = 0; i < array.length; i++) {
      iteration(array[i], i, array)
    }
  };
  var mapf = function(array, iteration) {
    var map = [];
    each(array, function(value,index) {
        map.push(iteration(value, index))
      });
    return map;
  };
  var filterf = function(array, test) {
    var passed = [];
    each(array, function(value,index) {
      if (test) {
        passed.push(value)
      }
    }); return passed;
  };
