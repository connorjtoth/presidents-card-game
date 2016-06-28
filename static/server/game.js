/* game.js */

var Card = require('./card.js');
var Deck = require('./deck.js');
var Player = require('./player.js');
var Players = require('./players.js')();
var Constants = require('./constants_server.js');

var NUM_OF_JOKERS = 2;
var TIMES_TO_SHUFFLE = 7;
var STARTING_CARD = new Card('C', 3);

var orderPlayers = function ( players )
{
  var temp = new Array();
  var first = -1;

  //get the latter half of players
  for (var i = 0; i < players.length; i++)
  {
    var player = players[i];
    var starts = player.hand.contains(STARTING_CARD);
    
    if (first < 0 && starts)
      first = i;

    if (first >= 0)
      temp.push(player);
  }

  //get the former half of players
  for (var i = 0; i < first; i++)
  {
    var player = players[i];
    temp.push(players[i]);
  }

  players = temp;
};

var PlayStruct = function (plr, type, cards)
{
  this.player = plr;
  this.turnType = type;
  this.cardsPlayed = cards;
  if (cards !== undefined)
    this.rank = cards[0].rank;
};



var Game = function ( players )
{
  console.log('creating new game');
  var game = this;

  this.players =
  {
    inGame: players,
    out: new Array(),
    other: new Array(),
    count: players.length,
    initialOrder: new Array()
  };

  this.round = 0; //the round number
  this.plays = new Array(); //plays this round;
  this.cardAmt = 1; //the number of cards to play this round
  this.playerNum = 0;
  this.currentPlayer = null;


  /**** Setup the values *****/

  console.log('setting up game');


  /* deal the cards out */
  var deck = new Deck(NUM_OF_JOKERS);
  deck.shuffle(TIMES_TO_SHUFFLE);
  deck.dealTo(game.players.inGame);

  /* order players */
  orderPlayers( game.players.inGame );
  game.players.initialOrder = game.players.inGame;

  /* update hands and select starting player */
  for (var player of game.players.inGame)
  {
    player.updateClientHand();
    if (player.hand.contains(STARTING_CARD))
    {
      game.currentPlayer = player;
    }
  }

  return this;
};

Game.prototype.updateLeaderboards = function()
{
  console.log('updating leaderboards');
  var game = this;
  var leaderstats = game.getLeaderboard();

  for (var player of game.players.initialOrder)
  {
    player.socket.emit('update-leaderboard', leaderstats);
  }
}
Game.prototype.getLeaderboard = function()
{
  var game = this;
  var leaderstats = new Array();
  for (var player of game.players.initialOrder)
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


Game.prototype.lastPlayer =  function()
{
  plays = this.plays;
  for (var i = plays.length - 1; i >= 0; i--)
  {
    if (plays[i].turnType === 'play')
    {
      return plays[i].player;
    }
  }
  
  return null;
};

Game.prototype.isPlayerSkipped = function()
{
  plays = this.plays;
  skips = false;

  var playIndices = new Array();
  for (var i = -1; i >= -plays.length && playIndices.length < 4; i--)
  {
    if (plays[i].turnType === 'play')
    {
      if (playIndices.length > 1)
        if (playIndices[0].rank === plays[i].rank)
          playIndices.push(i);
        else
          break;
      else
        playIndices.push(i);
    }
  }

  if ( (playIndices.length === 2 && playIndices[-1] >= -1)
    || (playIndices.length === 3 && playIndices[-1] >= -2)
    || (playIndices.length === 4 ) )
    skips = true;

  return skips;
};

Game.prototype.validateMove = function (moveCards)
{
  var game = this;
  var player = game.currentPlayer;

  //ensure a correct number of cards are being played
  if (moveCards.length !== game.cardAmt)
  {
    throw new Error( player.name + ' played ' + 
      moveCards.length + ' cards instead of ' + game.cardAmt);
  }

  //ensure player has control of these cards
  for (var card of moveCards)
  {
    if ( !player.hand.contains(card) )
    {
      throw new Error( player.name + ' doesn\'t control ' + card );
    }
  }

  //ensure valid card ranks
  var firstRank = moveCards[0].rank;
  for (var i = 0; i < moveCards.length; i++)
  {
    if (moveCards[i].rank !== firstRank)
    {
      throw new Error( player.name + ' must play all same rank');
    }
  }

  //if stack length is 0, must be 3 of clubs
  //TODO: Alter to allow multiple cards not just one
  if (game.plays.length === 0)
  {
    if (moveCards.length !== 1 ||
      moveCards[0].rank !== 3 ||
      moveCards[0].suit !== 'C')
      throw new Error(player.name + ' must play 3 of Clubs for first move');
  }

  //ensure is a appropriate value

  console.log('cards were valid');
  return true;
};

Game.prototype.notifyClients = function( )
{
  for (var player of this.players.inGame)
  {
    player.socket.emit('start-game');
  }
};

Game.prototype.getNextPlayer = function() {
  /* This function is to be executed when the game.currentPlayer has just
  made their turn (an entry to plays has been addded). All changes to 
  game.currentPlayer occur in this function. This will do all the skips 
  (due to cards being played) automatically notifying respective clients.
  */
  var game = this;
  var lastPlayer = game.currentPlayer;
  var plays = game.plays;
  var foundNext = false;
  do
  {
    game.playerNum = (++game.playerNum) % game.players.inGame.length;
    var prospPlayer = game.players.inGame[game.playerNum];

    if (game.isPlayerSkipped())
    {
      var thisPlay = new PlayStruct( prospPlayer, 'skip' );
      game.plays.push(thisPlay);
      console.log('This player was skipped');
    }
    else if ( game.lastPlayer() === prospPlayer )
    {
      console.log('The round has ended b/c went all the way around');
    }
    else
    {
      game.currentPlayer = prospPlayer;
      foundNext = true;
    }
  }
  while (!foundNext);

  return game.currentPlayer;
}

Game.prototype.getNextMove = function()
{
  var game = this;
  return Promise.resolve(true)
  .then( game.getNextPlayer )
  .then( function ( res )
  {
    console.log('get move');

    var player = game.currentPlayer;
  })
}
/*
var repeatUntilFail = function (promiseProvider)
{
  return new Promise( function ( resolve, reject )
  {
    var counter = 0;
    function run ( passedResult )
    {
      var promise = promiseProvider(passedResult, counter++);
      if (promise instanceof Promise)
      {
        promise.then(run).catch(reject);
      }
      else
        reject(promise);
    }
    run();
  });
}
*/

Game.prototype.getNextMove = function() {
  var game = this;
  console.log('next mv');
  game.getNextPlayer();
  game.getMove();
}
/*
Game.prototype.runRound = function() {
  var game = this;
  var roundManager = function( lastResult )
  {
    console.log('round mgr');
    game.getNextPlayer();
    return game.getMove()
      .then(function (res)
      {
        return roundManager(res);
      });
  };
  roundManager()
  .catch(function(err) { console.log('Error',err);});
}
*/

Game.prototype.getMove = function() {
  var game = this;
  var player = game.currentPlayer;
  return Promise.all([
    Promise.resolve(true)
      .then(function (res)
      {
        console.log('get move');
        player.socket.emit('message', 'it is your turn');
      })

      .then(function (res)
      {
        console.log('waiting on ' + player.name);
        player.socket.emit('allow-select-cards');
        player.socket.addListener('card-choices', function (a)
          {
            onCardsSubmitted (a, game);
          });
      }),
    Promise.resolve(true).then(function (res)
      {
        var p = this;
        setTimeout(function()
          {
            Promise.reject('timed out');
          }
        , 5000);
      })
    ]).catch(function (err)
  {
    console.log('ERROR', err);
  });
};




var onCardsSubmitted = function( cardsArr, game )
{
  console.log('on cards submitted');
  var player = game.currentPlayer;
  console.log('cards chosen: ', cardsArr);

  try
  {
    game.validateMove(cardsArr);
    console.log('cards are valid');
    player.hand.removeSet(cardsArr);
    player.updateClientHand();
    var playDetails = new PlayStruct(player, 'play', cardsArr);
    game.plays.push( playDetails );
    game.endMove(game);
  }
  catch (err)
  {
    console.log('cards are not valid');
    player.socket.emit('message', "Error" + err);
    console.log(err);
  }
};

Game.prototype.endMove = function ( )
{
  console.log(' end the current move ');
  var game = this;
  var player = game.currentPlayer;

  player.socket.removeListener('card-choices');
  player.socket.emit('disallow-select-cards');

  //notify clients of changes
  game.updateLeaderboards();

  if (player.hand.arr().length === 0)
  {
    game.players.inGame.remove(player);
    game.players.out.push(player);
    //end game
  }
  else
  {
    game.getNextMove();
    //end turn
  }
}

var onEndMove = function ( game )
{
  console.log('on end move');
  var player = game.currentPlayer;

};


Game.prototype.incrementRound = function ( )
{
  this.round++;
};



module.exports = Game;




/*
  
  do
  {
    incrementRound
    do
    {
      prePlay
      move
    }
    while (roundLoopConditional);
  }
  while(gameLoopConditional);

};

  

  function roundLoopCallback(err, res)
  {


    console.log('***roundLoopCallback***');
    console.log('err: ' + err);
    console.log('res: ' + res);
    console.log('***********************');
  }

  function roundLoopConditional()
  {
    return game.players.inGame.length !== 0;
  }


  //game loop
  async.doWhilst( function(callbackGame) {
    async.series([
      incrementRound,
      //round loop
      function (callbackRound) {
        async.doWhilst( function (callbackSubRound) {
          async.series([game.prePlay, move], 
            function (err, res) {
              callbackSubRound(err, res);
            })
        }, roundLoopConditional, callbackRound)
      }
    ],
    function ( err, res ) {
      callbackGame(err, res);
    })
  }, roundLoopConditional, roundLoopCallback);
}
*/
