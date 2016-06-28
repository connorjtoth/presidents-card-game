/* card.js */

var getRankText = function ( rank ) {
  switch ( rank ) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    case 14: return 'JOKER';
    default: return rank;
  }
}

var Card = function ( suit, rank ) {
  this.suit = suit;
  this.rank = rank;
  this.rankText = getRankText(rank);
  this.id = suit + '_' + rank;
}

module.exports = Card;