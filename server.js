/*
 * Init
 */

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

var io = require('socket.io')(server);

/*
 * Routes
 */

// Serve static content for the app from the “app/assets” directory in the application directory
app.use(express.static(__dirname + '/app/assets'));

// Route '/'
app.get('/', function(req, res){
  res.sendFile(__dirname + '/app/views/index.html');
});


/*
 * Chatroom
 */

// usernames which are currently connected to the chat
var usernames = {};
var usersTyping = [];

io.on('connection', function(socket) {
  var addedUser = false;

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function(username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[socket.id] = username;
    addedUser = true;
    socket.emit('login', {
      onlineUsers: usernames
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      addOnlineUser: socket.id
    });
  });

  socket.on('chat message', function(message){
    io.emit('chat message', {
      username: socket.username,
      message: message
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function() {
    usersTyping.push(socket.username);
    socket.broadcast.emit('typing', {
      usersTyping: usersTyping
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function() {
    usersTyping.splice(socket.username);
    socket.broadcast.emit('stop typing', {
      usersTyping: usersTyping
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function() {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.id];

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        removeOnlineUser: socket.id
      });
    }
  });

});
