var Play = function (player, cards) {
  this.user = player;
  this.quantity = cards.length;
  this.cards = cards;
  this.rank = cards[0];
}

module.exports = Play;