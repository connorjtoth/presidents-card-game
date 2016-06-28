/* members.js */
/* functions for members and name-lobby */

var onJoinClicked = function() {
  console.log('joining lobby...');
  //first set the name
  var username = nameField.val();
  socket.emit('set-name', username);
  //then join the server
  console.log('emitting join-lobby');
  socket.emit('join-lobby');
  console.log('refresh member list');
  requestRefreshMembersList();
  transitionBetween(introWrapper, membersWrapper, true);
}

var onStartClicked = function() {
  socket.emit('req-start-game');
}


var onStartGame = function() {
  transitionBetween(membersWrapper, gameWrapper);
}

socket.on('start-game', onStartGame);


joinButton.click(debounce(onJoinClicked, Infinity, 1));
startButton.click(debounce(onStartClicked, 1000, 1));

var requestRefreshMembersList = function( ) {
  socket.emit('req-refreshed-member-list');
};

var writeMemberList = function( array ) {
  var newMemberEntry = function(num, obj) {
    var propMap = new Map([
      ['number', num],
      ['name', obj.name],
      ['rank', obj.rank]
    ]);

    var root = $('<div>')
      .attr('class', 'member-entry');
    for (var className of propMap.keys()) {
      root.append( $('<div>')
        .attr( 'class', className )
        .text( propMap.get(className) )
      );
    }

    return root;
  };
  
  $('.members-wrapper .content .member-entry:gt(0)').remove();
  for (var i = 0; i < array.length; i++)
  {
    var entryDiv = newMemberEntry( i+1, array[i] );
    $('.members-wrapper .content').append(entryDiv);
  }
};

socket.on('refresh-member-list', writeMemberList);