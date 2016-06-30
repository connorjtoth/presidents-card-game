var Play = function (player, cards) {
  this.user = player;
  this.quantity = cards.length;
  this.cards = cards;
  this.rank = cards[0];
}

var DiscardPile = function ( ) {
  this.plays = new Array();
}

DiscardPile.prototype.addPlay = function ( player, cards ) {
  this.plays.push( new Play(player, cards) );
}

DiscardPile.prototype.getPlay = function ( n ) {
  return this.plays[plays.length - 1 - n];
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

  var lastFour = new Array();
  var i = 0;
  while (lastFour.length < 4 && i < this.playCount() ) {
    var tempPlay = this.getPlay(i);
    for (var j = 0; j < min(tempPlay.cards.length, 4 - lastFour.length); j++) {
      lastFour.push(tempPlay.cards[j]);
    }
    i++;
  }
  if (lastFour.length < 4)
    return false;
  return lastFour.every( function( card ) {
    return card.rank === lastFour[0].rank;
  });
}


module.exports = DiscardPile;