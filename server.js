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
      userId: socket.id,
      onlineUsers: usernames
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      addOnlineUser: socket.id
    });
  });

  socket.on('chat message', function(data){
    if (data.socket == 'common-message') {
      io.emit('chat message', {
        type: data.socket,
        socketId: '',
        username: socket.username,
        message: data.message
      });
    }
    else {
      socket.broadcast.to(data.socket).emit('chat message', {
        type: data.socket,
        socketId: socket.id,
        username: socket.username,
        message: data.message
      });
      socket.emit('chat message', {
        type: data.socket,
        socketId: data.socket,
        username: socket.username,
        message: data.message
      });
    }
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function(data) {
    if (data == 'common-message') {
      usersTyping.push(socket.username);
      socket.broadcast.emit('typing', {
        type: data,
        usersTyping: usersTyping,
        socketId: '',
        id: 'typing'
      });
    }
    else {
      socket.broadcast.to(data).emit('typing', {
        type: data,
        socketId: socket.id,
        username: socket.username,
        id: 'typing'
      });
    }
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function(data) {
    if (data == 'common-message') {
      usersTyping.splice(socket.username);
      socket.broadcast.emit('stop typing', {
        type: 'common-message',
        usersTyping: usersTyping,
        id: 'stop-typing'
      });
    }
    else {
      socket.broadcast.emit('stop typing', {
        type: data,
        socketId: socket.id,
        username: socket.username,
        id: 'stop-typing'
      });
    }
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
