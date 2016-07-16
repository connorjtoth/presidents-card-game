/**
 * Author: Connor J. Toth
 * Date: July 11, 2016
 * Version: 0
 * Filename: Deck.JS
 * Description: TODO
 */

/* Relevant Requires */
var Constants = require('./constants_server.js');
var Card = require('./card.js');


/**
 * Creates a deck of cards
 *
 * @param numJokers: the number of jokers to add to the deck
 */
module.exports = function ( numJokers ) {
  
  // the cards found in the deck
  var deck = new Array();
  
  // insert the standard A..K cards for all suits
  for ( var suit of Constants.suits )
    for ( var rank of Constants.ranks )
      deck.push( new Card(suit, rank) );

  // insert numJokers jokers into the deck of alternating suits
  var limit = (isNaN(numJokers)) ? 0 : numJokers;
  for ( var i = 0; i < numJokers; i++ )
    deck.push( new Card(Constants.suits[i % Constants.suits.length], 14) );


  /**
   * Randomizes the order of the cards
   *
   * @param times: the number of shuffles to perform (default is 7)
   */
  this.shuffle = function ( times ) {
    for ( var time = 0; time < (times || 7); time++ ) {
      for ( var i = 0; i < deck.length; i++ ) {
        var j = Math.floor(Math.random() * deck.length);
        var temp = deck[j];
        deck[j] = deck[i];
        deck[i] = temp;
      }
    }
  }

  /**
   * Partitions the deck into numHands hands
   *
   * @param numHands: the number of hands to return
   */
  this.deal = function ( numHands ) {
    var hands = new Array();
    var count = 0;

    for ( var i = 0; i < numHands; i++ ) {
      hands[i] = new Array();
    }

    for ( var i = 0; i < deck.length; i++ ) {
      hands[i % numHands].push(deck[i]);
    }

    return hands;
  };

  // its a feature not a bug
  var deal = this.deal;

  /**
   * Deals the cards to each player in playersArr
   * 
   * @param playersArr: array of Players to which to deal
   */
  this.dealTo = function ( playersArr ) {
    var numPlayers = playersArr.length;
    console.log('Dealing to ' + numPlayers + ' players');
    var hands = deal(numPlayers);
    for ( var i = 0; i < numPlayers; i++ ) {
      playersArr[i].hand = hands[i];
    }
  }

};