/* Card animations and drawing */

var DesignModule;

var DIV_TAG = '<div>';
var IMG_TAG = '<img>';


$( document ).ready( function ()
{
  (function (exports)
  {
    var getImagePath = function ( img, ns )
    {
      var images, root;
      if (ns === 'cards' || ns === undefined)
      {
        images = new Map([
          ['H', 'heart.png'],
          ['S', 'spade.png'],
          ['C', 'club.png'],
          ['D', 'diamond.png'],
          ['J', 'joker.png'],
          ['gloss', '../../gloss.png'],
          ['back', 'back.png']
        ]);
        root = 'res/images/cards/icons/';
      }

      return root + images.get(img);
    };

    exports.cardBack = function ( ) {

      var centerDiv = $(IMG_TAG)
      .addClass('center')
      .attr('src', getImagePath('back'));

      /* the gloss element */
      var glossImg = $(IMG_TAG)
      .addClass('gloss')
      .attr('src', getImagePath('gloss'));

      /* the card / put it altogether */
      var cardDiv = $(DIV_TAG)
      .addClass('cardback')
      .height('100%')
      .append(centerDiv)
      .append(glossImg)
      .mouseenter(cardAnims.mouseenter)
      .mouseleave(cardAnims.mouseleave)

      cardDiv.width(cardDiv.height() * 6/8);
      return cardDiv;
    },

    exports.printCard = function ( card )
    {
      var rankDiv, imgDiv, topDiv, lowDiv,
          centerImg, centerDiv, glossImg, cardDiv;

      var suit = card.suit,
          rank = card.rank;

      var rankId = 'reg-rank', //default value
          centerSrc = getImagePath(suit); //default value

      if (rank === 14)
      { 
        rankId = 'joker-rank';
        centerSrc = getImagePath('J');
      }

      /* the top corner element */
      rankDiv = $(DIV_TAG)
      .addClass('rank')
      .attr('id', rankId)
      .text(card.rankText);

      imgDiv = $(IMG_TAG)
      .addClass('corner-img')
      .attr('src', getImagePath(suit));

      topDiv = $(DIV_TAG)
      .addClass('corner')
      .attr('id', 'upper-corner')
      .append(rankDiv)
      .append(imgDiv);

      /* the lower corner element */
      lowDiv = topDiv.clone()
      .attr('id', 'lower-corner');

      /* the center element */
      centerImg = $(IMG_TAG)
      .addClass('center-img')
      .attr('src', centerSrc);

      centerDiv = $(DIV_TAG)
      .addClass('center')
      .append(centerImg);

      /* the gloss element */
      glossImg = $(IMG_TAG)
      .addClass('gloss')
      .attr('src', getImagePath('gloss'));

      /* the card / put it altogether */
      cardDiv = $(DIV_TAG)
      .addClass('card')
      .attr('id', card.id)
      .height('100%')
      .append(topDiv)
      .append(centerDiv)
      .append(lowDiv)
      .append(glossImg)
      .mouseenter(cardAnims.mouseenter)
      .mouseleave(cardAnims.mouseleave)

      cardDiv.width(cardDiv.height() * 6/8);
      return cardDiv;
    };
  })(DesignModule = {});
});

var hideDiv = function ( jqDiv )
{
  jqDiv
  .delay(500)
  .animate({opacity: 0}, 'slow');
};

var showDiv = function ( jqDiv ) {
  jqDiv
  .delay(500)
  .css('visibility', 'visible')
  .animate({opacity: 1}, 'slow');
};
var transitionBetween = function (outDiv, inDiv, remove)
{
  hideDiv(outDiv);
  setTimeout(function( ) {
    if (remove)
      outDiv.remove();
    showDiv(inDiv);
  }, 1000);
};





var cardAnims, btnAnims, anims, layout;
$(document).ready(function() {
  (function(exports) {

    exports.mouseenter = function() {
      $(this)
        .clearQueue()
        .animate({top: -50}, 300);
    };

    exports.mouseleave = function() {
      $(this)
        .clearQueue()
        .animate({top: 0}, 300);
    };

    exports.click = function( evt, card ) {
      var target = evt.delegateTarget;
      var targetSelected = $(target).hasClass('card-selected');
      if (targetSelected) {
        $(target)
          .mouseenter(exports.mouseenter)
          .mouseleave(exports.mouseleave)
          .clearQueue()
          .removeClass('card-selected');
      }
      else {
        $(target)
          .off('mouseenter')
          .off('mouseleave')
          .clearQueue()
          .css('top', '-50px')
          .addClass('card-selected');
      }
    }
  })(cardAnims = {});

  (function ( exports ) {
    exports.positionCards = function( cardGuis ) {
      var invDiv = $('.inventory');

      var invWidth = invDiv.width(),
          invHeight = invDiv.height(),
          cardWidth = .75 * invHeight,
          cardRatio = cardWidth / invWidth,
          phi = (1 - cardRatio) / (cardGuis.length - 1);

      for (var i = 0; i < cardGuis.length; i++) {
        var pos = phi * i * 100;
        cardGuis[i]
        .css('left', pos + '%')
        .width(cardWidth);
        //setZIndex(cardGuis[i], i);
        //post it
        invDiv.append(cardGuis[i]);
      }
    };


  })(layout = {});

});
