/* cards.js */

var Constants = require('./constants_server.js');

module.exports = {
  sortFunction: function (c1, c2) {
    var order = Constants.Presidents.sortOrder;
    var first = order.indexOf( c1.rank );
    var second = order.indexOf( c2.rank );
    return (first - second);
  }
};