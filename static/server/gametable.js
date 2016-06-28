/* game.js */

var Player = require('./player.js');
var Players = require('./players.js')();
var Constants = require('./constants_server.js');
var Game = require('./game.js');

var GameTable = function ( players ) {
  console.log('creating new game table');
  var table = this;

  this.players = {
    playing: players,
    spectating: new Array(),
    count: players.length,
    order: new Array()
  };

  this.gameCount = 0; // count of games
  this.game = new Game(this.players.playing);
};


module.exports = GameTable;

