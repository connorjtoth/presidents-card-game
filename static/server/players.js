/* Players.js */




var Player = require('./player.js');

module.exports = function ( sockets )
{
  var players = new Array();
  if (sockets !== undefined )
    for (var socket of sockets)
      this.add(socket);

  this.add = function ( socket )
  {
    var player = new Player( socket );
    console.log('adding ' + player.socket.id);
    players.push( player );
    this.logCount();
    return player;
  };

  this.getFromId = function ( id )
  {
    for (var player of players) {
      if (player.socket.id === id)
        return player;d
    }

    return null;
  };

  this.remove = function ( socket )
  {
    var id = socket.id;
    for (var player of players)
    {
      if (player.socket.id === id)
      {
        console.log('removing ' + player.name);
        players.pop(player);
        this.logCount();
      }
    }
  };

  this.logCount = function()
  {
    console.log('currently ' + players.length + ' players');
  };

  this.getList = function()
  {
    var list = new Array();
    for (var player of players)
    {
      list.push({
        name: player.name,
        rank: '-'
      });
    }

    return list;
  };

  this.getArr = function()
  {
    return players;
  }

  return this;
}