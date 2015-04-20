  /*
   * Socket events
   */

  // Whenever the server emits 'login', log the login message
  socket.on('login', function(data) {
    connected = true;
    onlineUsers(data);
    initPrivatesChats(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function(data) {
    log(data.username + ' joined the chat');
    addOnlineUser(data);
    addPrivateChat(data);
  });

  socket.on('chat message', function(data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function(data) {
    updateUsersWhoAreTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function(data) {
    updateUsersWhoAreTyping(data);
  });

   // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function(data) {
    log(data.username + ' left the chat');
    removeOnlineUser(data);
  });
