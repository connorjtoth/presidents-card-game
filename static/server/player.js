/* Player.js */

var Constants = require('./constants_server.js');
var Cards = require('./cards.js');

module.exports = function(socket)
{
  var context = this;
  this.socket = socket;
  this.name = 'John Doe';
  this.playing = false;
  this.hand = undefined;
  this.joinTime = undefined;

  this.setName = function ( name ) {
    if (name === undefined || name.trim() === '')
      name = 'John Doe';
    context.name = name;
    console.log('user ' + context.socket.id 
      + ' now named \'' + name + '\'');
  };

  this.updateClientHand = function () {
    var handArr = context.hand.arr();
    handArr.sort(Cards.sortFunction);
    context.socket.emit('update-hand', handArr);
    console.log('updated ' + context.name + '\'s hand');
  };

  this.refreshMemberList = function( players ) {
    context.socket.emit('refresh-member-list', players.getList());
  };

  return this;
};