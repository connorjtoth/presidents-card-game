var NUM_OF_JOKERS = 2;
var TIMES_TO_SHUFFLE = 7;
var STARTING_CARD = new Card('C', 3);

var orderPlayers;

var Game = function ( players ) {
  console.log('starting new game');
  var game = this;

  this.players = {
    inGame: players,
    outOfGame: new Array(),
    count: players.length,
    order: new Array()
  };

  this.roundCount = 0; // round number
  this.discardedCards = ;//TODO
  this.lastActivePlayer = null;
  this.currentPlayer = null;
  this.playerNum = 0;

  /* Initialization and setup */
  console.log('setting up the game');

  //deal cards
  var deck = new Deck(NUM_OF_JOKERS);
  deck.shuffle();
  deck.dealTo(game.players.inGame);

  //order players
  orderPlayers(game.players.inGame);
  game.players.order = game.players.inGame;

  //update hands and select starting player
  for (var player of game.players.inGame) {
    player.updateClientHand();
  }
  game.currentPlayer = game.players.inGame[0];

  return this;
}

orderPlayers = function ( players ) {
  var temp = new Array();
  var first = -1;

  //get the latter half of players
  for (var i = 0; i < players.length; i++) {
    var player = players[i];
    var starts = player.hand.contains(STARTING_CARD);
    
    if (first < 0 && starts)
      first = i;

    if (first >= 0)
      temp.push(player);
  }

  //get the former half of players
  for (var i = 0; i < first; i++) {
    var player = players[i];
    temp.push(players[i]);
  }

  players = temp;
};

Game.prototype.getLeaderboard = function ( ) {
  var game = this;
  var leaderstats = new Array();
  for ( var player of game.players.order )
  {
    var leaderstat = {
      inGame: (game.players.inGame.indexOf(player) >= 0),
      username: player.name,
      rank: player.rank,
      cards: player.hand.arr().length
    };

    leaderstats.push(leaderstat);
  }
  return leaderstats;
};

Game.prototype.updateLeaderboards = function ( ) {
  console.log('updating leaderboards');
  var game = this;
  var leaderstats = game.getLeaderboard();

  for (var player of game.players.order()) {
    player.socket.emit('update-leaderboard', leaderstats);
  }
}

Game.prototype.nextPlayer = function() {

  var game = this;
  var lastPlayer = game.currentPlayer;
  var plays = game.plays;

  game.playerNum = (++game.playerNum) % game.players.inGame.length;
  game.currentPlayer = game.players.inGame[game.playerNum];
  return game.currentPlayer;
}

Game.prototype.setPlayer = function ( nextPlayer ) {
  console.log('finding next player');
  var game = this;
  while (game.nextPlayer() != nextPlayer);
}

Game.prototype.startRound = function ( ) {
  var game = this;

  var quantity = 0;
  var play = 0;
  //PRE GAME

  // MID ROUD





  // POST ROUND CLEANUP

  // make the next player the last person to play
  var roundWinner = game.lastActivePlayer;
  game.setPlayer(roundWinner);
  if ( !roundWinner.hasCards() ) {
    game.nextPlayer();
    game.onOutOfCards(roundWinner);
  }
}