var DiscardPile = require('./discardpile.js')
var Card = require('./card.js');
var Deck = require('./deck.js');

function isEqual(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

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
  this.round = {quantity: 0, first: true};

  /* Initialization and setup */
  console.log('setting up the game');

  //deal cards
  var deck = new Deck(NUM_OF_JOKERS);
  deck.shuffle();
  deck.dealTo(game.players.inGame);

  //order players
  game.players.inGame = game.orderPlayers(game.players.inGame);
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
    var starts = false;

    for (var card of player.hand) {
      if (isEqual(STARTING_CARD, card)) {
        starts = true;
        break;
      }
    }

    if (first < 0 && starts) {
      first = i;
      console.log(player.name + ' has the ' + STARTING_CARD);
    }

    if (first >= 0)
      temp.push(player);
  }

  //get the former half of players
  for (var i = 0; i < first; i++) {
    temp.push(players[i]);
  }

  players = temp;
  return temp;
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
      cards: player.hand.length,
      active: player === game.currentPlayer
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
  var game = this;
  var player = game.currentPlayer;
  console.log('on cards submitted');
  console.log('cards chosen: ', cardsArr);

  try {
    game.validateMove(cardsArr);

    //remove cards in cardsArr
    player.hand = player.hand.filter( function (val) {
      for ( card of cardsArr ) {
        if ( isEqual(val, card) )
          return false;
      }
      return true;
    });
    game.round.quantity = cardsArr.length;
    player.updateClientHand();
    game.discard.addPlay(player, cardsArr);
  }
  catch (err) {
    player.socket.emit('message', "Error: " + err);
    console.log(err);
    return;
  }
  game.endMove(callback);
};

/* PLAYER MOVES */
Game.prototype.getMove = function ( callback ) {
  var game = this;
  var player = game.currentPlayer;

  console.log('get move');
  player.socket.emit('message', 'it is your turn');

  console.log('waiting on ' + player.name);
  player.socket.emit('allow-select-cards');
  player.socket.addListener('card-choices', function (cardsArr) {
    console.log('got card-choices: ', cardsArr);
    game.onCardsSubmitted(cardsArr, callback);
  });

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

  player.socket.removeAllListeners('card-choices');
  player.socket.emit('disallow-select-cards');

  game.afterMove( callback );
}

Game.prototype.shouldEndRound = function ( ) {
  var game = this;

  if (!game.lastActivePlayer)
    return false;

  // this should be evaluated when lastActivePlayer is not who just played their card
  // and currentPlayer is the player who just played their cards

  // end if player just played last card(s)
  if ( game.lastActivePlayer.hand.length === 0 ) {
    console.log('last player has no more cards');
    return true;
  }

  // if last active player is the current player
  if ( game.lastActivePlayer === game.currentPlayer ) {
    console.log('last player is the current player');
    return true;
  }

  // four of the same rank played in a row
  if (game.discard.lastFourSame()) {
    console.log('last four are same');
    return true;
  }

  // a joker was played
  console.log(game.discard.getRank(0));

  if (game.discard.getRank(0) === 14) {
    console.log('joker played');
    return true;
  }

  return false;
}



Game.prototype.afterMove = function ( callback ) {
  var game = this;



  // no longer first move of the round
  if (game.round.first)
    game.round.first = false;

  if ( !game.shouldEndRound() ) {

    game.lastActivePlayer = game.currentPlayer;
    console.log('not ending round');
    game.nextPlayer();

    //notify clients of changes
    game.updateLeaderboards();

    game.getMove();
  }
  else {
    game.afterRound();
  }

}

Game.prototype.afterRound = function ( ) {
  var game = this;
  console.log('ending round');
  game.setPlayer(game.lastActivePlayer);
  
  // if out of cards, next player is going to be first player
  if (game.lastActivePlayer.hand.length === 0) {
    game.nextPlayer();
  }
}



Game.prototype.validateMove = function ( moveCards ) {
  var game = this;
  var round = game.round;
  var player = game.currentPlayer;

  if (moveCards.length === 0) {
    throw new Error('no cards played');
  }
  
  //ensure a correct number of cards are being played
  if (!game.round.first && moveCards.length != game.round.quantity) {
    throw new Error( player.name + ' played ' + 
      moveCards.length + ' cards instead of ' + round.quantity);
  }

  //ensure player has control of these cards
  for (var card of moveCards) {
    if ( !player.hand.find( function (val) { return isEqual(val,card); } ) ) {
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
  if (game.discard.playCount() == 0) {
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
    lastPlayedRank = game.discard.getRank(0);
    if (firstRank < lastPlayedRank) {
      throw new Error(player.name + ' must play greater or equal rank cards');
    }
  }

  console.log('cards were valid');
  return true;
}



/* ROUND STUFF */


Game.prototype.startRound = function ( ) {
  var game = this;
  game.round = {quantity: 0, first: true};

  game.getMove();
}



module.exports = Game;