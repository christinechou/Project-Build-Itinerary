// Baseline setup
// --------------


  // Collection Functions
  // --------------------

  // JS Native method on arrays, forEach:
  var each = function(collection, iterator) {
    if (collection === null) return;
    if (Array.isArray(collection)) {
      for (var i = 0; i < collection.length; i++) {
        iterator(collection[i], i, collection)
      }
    }
    else {
      for (var key in collection) {
        iterator(collection[key], key, collection)
      };
    }
  };
