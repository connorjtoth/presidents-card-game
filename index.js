/* Node modules */
var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    async = require('async');

/* Private modules */

var Constants = require('./static/server/constants_server.js');
var Players = require('./static/server/players.js')();
var Game = require('./static/server/game.js');



var gameInProgress = false;

//TODO: add rooms/servers

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('static'));

var runGame;

var refreshLoop = setInterval(function() {
  io.to('lobby').emit('refresh-member-list', Players.getList());
}, 1000);

var LISTENING_PORT = 80;


http.listen(LISTENING_PORT, function() {
  console.log('listening on *:' + LISTENING_PORT);
});

var canStartGame = function ( socket ) {
  if ( gameInProgress ) {
    throw new Error('a game is already in progress');
  }
  //else if (Players.getArr().length < 3) {
  //  throw new Error('must have at least three players to start');
  //}
  else {
    return true;
  }
}

var onNewConnection = function ( socket ) {
  var id = socket.id;
  var player = Players.add( socket );

  socket.join('name-room');
  socket.on('set-name', player.setName);

  socket.on('message', function(data) {
    console.log('Message from ' + player.name + ': ', data);
  });

  var refreshMemberList = function() {
    socket.emit('refresh-member-list', Players.getList());
  };

  socket.on('join-lobby', function() {
    console.log(player.name + ' joining lobby');
    socket.join('lobby');

    socket.on('req-refreshed-member-list', refreshMemberList);
    
    socket.on('req-start-game', function() {
      if (canStartGame(socket)) {
        gameInProgress = true;
        for (var aplayer of Players.getArr()) {
          aplayer.socket.leave('lobby');
          aplayer.socket.join('game-room');
          console.log(aplayer.name + ' moved from lobby to game');
        }
        console.log('starting game');
        runGame(Players.getArr());
      }
    });
  });
  

  socket.on('disconnect', function() {
    Players.remove(socket);
  });
};



var runGame = function( players ) {

  var game = new Game( players );

}

io.on('connection', onNewConnection);
