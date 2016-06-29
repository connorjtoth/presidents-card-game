/* Decks.js */
var Constants = require('./constants_server.js');
var Card = require('./card.js');
var Table = require('./stack.js');
module.exports = function (numJokers) {
  var deck = new Array();
  
  for (var suit of Constants.suits)
    for (var rank of Constants.ranks)
      deck.push( new Card(suit, rank) );

  var limit = (isNaN(numJokers)) ? 0 : numJokers;
  for (var i = 0; i < numJokers; i++) {
    deck.push( new Card(Constants.suits[i], 14) );
  }

  this.shuffle = function(times) {
    for (var time = 0; time < (times || 7); time++) {
      for (var i = 0; i < deck.length; i++) {
        var j = Math.floor(Math.random() * deck.length);
        var temp = deck[j];
        deck[j] = deck[i];
        deck[i] = temp;
      }
    }
  }

  this.deal = function( numHands ) {
    var hands = new Array();
    var count = 0;

    for (var i = 0; i < numHands; i++) {
      hands[i] = new Table();
    }

    for (var i = 0; i < deck.length; i++) {
      hands[i % numHands].push(deck[i]);
    }

    return hands;
  };

  var deal = this.deal;

  this.dealTo = function( playersArr ) {
    var num  = playersArr.length;
    console.log('num: ' + num);
    var hands = deal(num);
    for (var i = 0; i < num; i++) {
      playersArr[i].hand = hands[i];
    }
  }

};