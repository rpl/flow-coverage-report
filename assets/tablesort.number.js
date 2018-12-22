;(function(){
  var cleanNumber = function(i) {
    return i.replace(/[^\-?0-9.]/g, '');
  },

  compareNumber = function(a, b) {
    var fa = parseFloat(a);
    var fb = parseFloat(b);

    na = isNaN(fa) ? 0 : fa;
    nb = isNaN(fb) ? 0 : fb;

    return fa - fb;
  };

  Tablesort.extend('number', function(item) {
    return item.match(/^[-+]?(\d)*-?([,\.]){0,1}-?(\d)+([E,e][\-+][\d]+)?\s?%?$/); // Number
  }, function(a, b) {
    return compareNumber(cleanNumber(b), cleanNumber(a));
  });
}());
