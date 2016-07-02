/* non-game functions */

/* gameClient */
var gameClient = {};

var createLeaderboardEntry = function ( leaderstat )
{
  var propMap = new Map([
    ['username', leaderstat.username],
    ['rank', leaderstat.rank],
    ['cards', leaderstat.cards]
  ]);

  var entry = $('<div>')
  .addClass('player-entry');

  if (leaderstat.active)
    entry.addClass('active');


  for (var prop of propMap.keys())
  {
    var field = $('<div>')
    .addClass(prop)
    .text(propMap.get(prop));

    entry.append(field);
  }

  return entry;
};

gameClient.printLeaderboard = function ( leaderstats )
{
  var plrList = $('.player-list');
  plrList.empty();
  
  for (var datum of leaderstats)
  {
    var entry = createLeaderboardEntry(datum);
    plrList.append(entry);
  }
};

gameClient.printMessage = function ( text ) {
  console.log('message from server: ', text);
  var closeBtn = $('<button>')
  .text('close');

  var contentDiv = $('<div>')
  .addClass('content')
  .text( text )
  .append(closeBtn);

  var headerDiv = $('<div>')
  .addClass('header')
  .text('Error!');

  var msgDiv = $('<div>')
  .addClass('message-wrapper')
  .append(headerDiv)
  .append(contentDiv);

  closeBtn.click(function ( ) { msgDiv.remove(); });

  $('body').append(msgDiv);
};

// hand functions
var stack = new Array();
var inv = $('.inventory');
var guiMap = new Map();

var pushToStack = function ( card, guiMap ) {
  //check if card matches rank other cards
  for (var stackedCard of stack) {
    if (stackedCard.rank !== card.rank) {
      // remove this card from the stack
      //do some animations
      var entryGui = guiMap.get(stackedCard);

      //actual removal from stack
      stack.splice(stack.indexOf(stackedCard));

      // back to animation
      if (entryGui.hasClass('card-selected')) {
        cardAnims.click({delegateTarget: entryGui}, entryGui);
        entryGui.trigger('mouseleave');
      }
    }
  }
  //add the card to the stack
  stack.push(card);
};

gameClient.updateHand = function ( hand ) {
  console.log('updating hand');
  guiMap = new Map();
  var cardGuis = new Array();

  inv.empty();
  //get gui and push to cardGuis
  for (var card of hand) {
    var gui = DesignModule.printCard(card);
    guiMap.set(card, gui);
    var onclick = (function (card) {
      return function(evt) {
        cardAnims.click(evt, card);
        var selected = $(evt.delegateTarget).hasClass('card-selected');
        if ( selected )
          pushToStack( card, guiMap );
        else
          stack.splice(stack.indexOf(card));
      }
    })(card);
    $(gui).click(onclick);
    cardGuis.push(gui);
  }

  layout.positionCards(cardGuis);
};

gameClient.onPlayClicked = function() {
  console.log('play clicked');
  socket.emit('card-choices', stack);
  for ( var stackedCard of stack ) {
    var stackedCardGui = guiMap.get(stackedCard);

    if (stackedCardGui.hasClass('card-selected')) {
      cardAnims.click({delegateTarget:stackedCardGui}, stackedCardGui);
      stackedCardGui.trigger('mouseleave');
    }
  }

  stack = new Array();
};

gameClient.onGetCardSelections = function ( ) {
  $('.play').click(debounce(gameClient.onPlayClicked, 1000 ));
};

gameClient.onDisableCardSelections = function ( ) {
  $('.play').off('click');
};

socket.on('update-leaderboard', gameClient.printLeaderboard);
socket.on('update-hand', gameClient.updateHand);
socket.on('allow-select-cards', gameClient.onGetCardSelections);
socket.on('disallow-select-cards', gameClient.onDisableCardSelections);
socket.on('message', gameClient.printMessage);