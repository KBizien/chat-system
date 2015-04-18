/*
 * Init
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


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
var numUsers = 0;

io.on('connection', function(socket) {
  var addedUser = false;

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('chat message', function(message){
    io.emit('chat message', {username: socket.username, message: message});
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

});


/*
 * Server port
 */

http.listen(3000, function(){
  console.log('listening on *:3000');
});
