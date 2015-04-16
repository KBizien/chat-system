var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket){
  console.log('A user logged in');
  io.emit('chat message', 'A user logged in');

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function(){
    io.emit('chat message', 'A user logged out');
    console.log('A user logged out');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
