var Play = require('./play.js');

var DiscardPile = function ( ) {
  this.plays = new Array();
}

DiscardPile.prototype.addPlay = function ( player, cards ) {
  this.plays.push( new Play(player, cards) );
}

DiscardPile.prototype.getPlay = function ( n ) {
  return this.plays[this.plays.length - 1 - n];
}

DiscardPile.prototype.playCount = function ( ) {
  return this.plays.length;
}

DiscardPile.prototype.getRank = function ( n ) {
  return this.getPlay(n).rank;
}

DiscardPile.prototype.lastFourSame = function ( ) {
  if (this.playCount() === 0)
    return false;

  var last = new Array();

  for (var i = 0; i < this.playCount() && last.length < 4; i++) {
    var temp = this.getPlay(i);
    var limit = Math.min(temp.cards.length, 4 - last.length);
    for (var j = 0; j < limit; j++) {
      last.push(temp.cards[j]);
    }
  }

  if (lastFour.length < 4)
    return false;
  else {
    return last.every( function( card ) {
      return card.rank === last[0].rank;
    });
  }

}


module.exports = DiscardPile;