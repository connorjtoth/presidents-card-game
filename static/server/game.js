var DiscardPile = require('./discardpile.js')
var Card = require('./card.js');
var Deck = require('./deck.js');

var NUM_OF_JOKERS = 2;
var TIMES_TO_SHUFFLE = 7;
var STARTING_CARD = new Card('C', 3);


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
  this.discard = new DiscardPile();
  this.lastActivePlayer = null;
  this.currentPlayer = null;
  this.playerNum = 0;
  this.moveTimer = null;
  this.round = {quantity: 0};

  /* Initialization and setup */
  console.log('setting up the game');

  //deal cards
  var deck = new Deck(NUM_OF_JOKERS);
  deck.shuffle();
  deck.dealTo(game.players.inGame);

  //order players
  game.orderPlayers(game.players.inGame);
  game.players.order = game.players.inGame;

  //update hands and select starting player
  for (var player of game.players.inGame) {
    player.updateClientHand();
  }
  game.currentPlayer = game.players.inGame[0];

  /* Inform client */
  game.notifyClients();
  game.updateLeaderboards();
  game.startRound();


  return this;
}

Game.prototype.notifyClients = function ( ) {
  for (var player of this.players.inGame) {
    player.socket.emit('start-game');
  }
}

/* PLAYER ORDERING */

Game.prototype.orderPlayers = function ( players ) {
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

/* LEADERBOARD */

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

  for (var player of game.players.order) {
    player.socket.emit('update-leaderboard', leaderstats);
  }
}

/* CHANGING PLAYERS */

Game.prototype.numPlayersToSkip = function ( ) {
  var game = this;

  //hard coding is shorter than iteration
  if ( discard.getRank(0) == discard.getRank(1) ) {
    if ( discard.getRank(0) == discard.getRank(2) ) {
      if (discard.getRank(0) == discard.getRank(3) ) {
        //end round
      }
      else { return 2; }
    }
    else { return 1; }
  }
  else { return 0; }
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

Game.prototype.skipPlayers = function ( n ) {
  var game = this;
  for (var i = 0; i < n; i++) {
    game.nextPlayer();
  }
}

Game.prototype.onCardsSubmitted = function ( cardsArr, callback ) {
      console.log('on cards submitted');
      var player = game.currentPlayer;
      console.log('cards chosen: ', cardsArr);

      try {
        game.validateMove(cardsArr);
        console.log('cards are valid');
        player.hand.removeSet(cardsArr);
        player.updateClientHand();

        var playDetails = new PlayStruct(player, cardsArr);
        game.discardPile.addPlay(playDetails);
        game.endMove(callback);
      }
      catch (err) {
        console.log('cards are not valid');
        player.socket.emit('message', "Error" + err);
        console.log(err);
      }
    });

/* PLAYER MOVES */
Game.prototype.getMove = function ( callback ) {
  var game = this;
  var player = game.currentPlayer;

  console.log('get move');
  player.socket.emit('message', 'it is your turn');

  console.log('waiting on ' + player.name);
  player.socket.emit('allow-select-cards');
  player.socket.addListener('card-choices', function (cardsArr) {
    game.onCardsSubmitted(cardsArr, callback);
  }

  game.moveTimer = setTimeout(function() {
    console.log(player.name + '\'s move timed out');
    game.endMove(callback);
  }, 60 * 1000);
}


Game.prototype.endMove = function ( callback ) {
  console.log(' end the current move ');
  var game = this;
  var player = game.currentPlayer;

  clearTimeout(game.moveTimer);

  player.socket.removeListener('card-choices');
  player.socket.emit('disallow-select-cards');

  //notify clients of changes
  game.updateLeaderboards();
}



Game.prototype.afterMove = function ( callback ) {
  var game = this;
  if ( game.discard.size() > 0 ) {
    var roundWinner = game.lastActivePlayer;
    game.setPlayer(roundWinner);

    // if out of cards, next player is going to be first player
    if ( !roundWinner.hand.arr().length === 0 ) {
      game.nextPlayer();
    }

    //determine to end the game
    if ( roundWinner.hand.arr().length === 0 ) {
      //END ROUND
    }
  }

}


Game.prototype.validateMove = function ( moveCards ) {
  var game = this;
  var round = game.round;
  var player = game.currentPlayer;
  
  //ensure a correct number of cards are being played
  if (moveCards.length != game.round.quantity) {
    throw new Error( player.name + ' played ' + 
      moveCards.length + ' cards instead of ' + round.quantity);
  }

  //ensure player has control of these cards
  for (var card of moveCards) {
    if ( !player.hand.contains(card) ) {
      throw new Error( player.name + ' doesn\'t control ' + card );
    }
  }

  //ensure valid card ranks
  var firstRank = moveCards[0].rank;
  for (var card of moveCards) {
    if (card.rank != firstRank) {
      throw new Error( player.name + ' must play all same rank');
    }
  }

  //first card of the game must be 3 of clubs
  if (game.discardPile.length == 0) {
    var foundStartCard = false;
    for (var card of moveCards) {
      if (card.rank === STARTING_CARD.rank && card.suit === STARTING_CARD.suit) {
        foundStartCard = true;
        break;
      }
    }
    if (!foundStartCard) {
      throw new Error(player.name + ' must play ' + STARTING_CARD + ' for first move');
    }
  }

  //ensure card is valid wrt discard pile
  else {
    lastPlayedRank = discardPile[0];
    if (firstRank < lastPlayedRank) {
      throw new Error(player.name + ' must play greater or equal rank cards');
    }
  }

  console.log('cards were valid');
  return true;
}




Game.prototype.onCardsSubmitted = function( cardsArr ) {
  game = this;
  console.log('on cards submitted');
  var player = game.currentPlayer;
  console.log('cards chosen: ', cardsArr);

  try {
    game.validateMove(cardsArr);
    console.log('cards are valid');
    player.hand.removeSet(cardsArr);
    player.updateClientHand();

    var playDetails = new PlayStruct(player, cardsArr);
    game.discardPile.addPlay(playDetails);
    game.endMove();
  }
  catch (err) {
    console.log('cards are not valid');
    player.socket.emit('message', "Error" + err);
    console.log(err);
  }
};


/* ROUND STUFF */


Game.prototype.startRound = function ( ) {
  var game = this;

  var quantity = 0;


  // MID ROUD
  game.getMove();
}



module.exports = Game;