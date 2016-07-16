/**
 * @file Provides modules that draw and animate cards 
 * @author Connor J. Toth
 */





var DesignModule;

$( document ).ready( function ( ) {

  (function ( exports ) {

    var getImagePath = function ( imgkey ) {
      var root = 'res/images/cards/icons/';
      var image_uri;

      switch ( imgkey ) {
        case 'H':
          image_uri = 'heart.png';
          break;
        case 'S':
          image_uri = 'spade.png';
          break;
        case 'C': 
          image_uri = 'club.png';
          break;
        case 'D':
          image_uri = 'diamond.png';
          break;
        case 'J':
          image_uri = 'joker.png';
          break;
        case 'gloss':
          image_uri = '../../gloss.png';
          break;
        case 'back':
          image_uri = 'back.png';
          break;
        default:
          throw new Error('imgkey ' + imgkey + ' unrecognized');
      }

      return root + image_uri;
    };

    exports.cardBack = function ( ) {
      var centerDiv = $('<img>')
      .addClass('center')
      .attr('src', getImagePath('back'));

      /* the gloss element */
      var glossImg = $('<img>')
      .addClass('gloss')
      .attr('src', getImagePath('gloss'));

      /* the card / put it altogether */
      var cardDiv = $('<div>')
      .addClass('cardback')
      .height('100%')
      .append(centerDiv)
      .append(glossImg)
      .mouseenter(cardAnims.mouseenter)
      .mouseleave(cardAnims.mouseleave)

      cardDiv.width(cardDiv.height() * 6/8);
      return cardDiv;
    },

    exports.printCard = function ( card ) {
      var rankDiv, imgDiv, topDiv, lowDiv,
          centerImg, centerDiv, glossImg, cardDiv;

      var suit = card.suit,
          rank = card.rank;

      var rankId = 'reg-rank', //default value
          centerSrc = getImagePath(suit); //default value

      if ( rank === 14 ) { 
        rankId = 'joker-rank';
        centerSrc = getImagePath('J');
      }

      /* the top corner element */
      rankDiv = $('<div>')
      .addClass('rank')
      .attr('id', rankId)
      .text(card.rankText);

      imgDiv = $('<img>')
      .addClass('corner-img')
      .attr('src', getImagePath(suit));

      topDiv = $('<div>')
      .addClass('corner')
      .attr('id', 'upper-corner')
      .append(rankDiv)
      .append(imgDiv);

      /* the lower corner element */
      lowDiv = topDiv.clone()
      .attr('id', 'lower-corner');

      /* the center element */
      centerImg = $('<img>')
      .addClass('center-img')
      .attr('src', centerSrc);

      centerDiv = $('<div>')
      .addClass('center')
      .append(centerImg);

      /* the gloss element */
      glossImg = $('<img>')
      .addClass('gloss')
      .attr('src', getImagePath('gloss'));

      /* the card / put it altogether */
      cardDiv = $('<div>')
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

var hideDiv = function ( jqDiv ) {
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

var transitionBetween = function (outDiv, inDiv, remove) {
  hideDiv(outDiv);
  setTimeout( function( ) {
    if ( remove )
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
  })( cardAnims = {} );

  ( function ( exports ) {
    exports.positionCards = function ( cardGuis ) {

      var invDiv = $('.inventory');

      
      var cardWidth = .75 * invDiv.height(),

      // ratio between card widths and their container
          cardRatio = cardWidth / invDiv.width(),

      // factor that represents a unit card offset amount
          phi = (1 - cardRatio) / (cardGuis.length - 1);
          

      for ( var i = 0; i < cardGuis.length; i++ ) {
        var pos = phi * i * 100;
        cardGuis[i]
        .css('left', pos + '%')
        .width(cardWidth);

        //setZIndex(cardGuis[i], i);
        
        // actually displays the card
        invDiv.append(cardGuis[i]);
      }
    };


  })( layout = {} );
});
