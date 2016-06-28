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


module.exportss = DiscardPile;