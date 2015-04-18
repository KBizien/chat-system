/*
 * Constantes
 */

var TYPING_TIMER_LENGTH = 1200; // ms


/*
 * Variables
 */

var $window = $(window);
var $messages = $('.messages'); // Messages area
var $usernameInput = $('.usernameInput'); // Input for username
var $inputMessage = $('.inputMessage'); // Input message input box
var $loginPage = $('.login.page'); // The login page
var $chatPage = $('.chat.page'); // The chatroom page

// Prompt for setting a username
var username;
var connected = false;

var typing = false;
var lastTypingTime;

var $currentInput = $usernameInput.focus();

var socket = io();


/*
 * Functions
 */

 // Sets the client's username
function setUsername() {
  username = cleanInput($usernameInput.val().trim());

  // If the username is valid
  if (username) {
    $loginPage.hide();
    $chatPage.show();
    $loginPage.off('click');
    $currentInput = $inputMessage.focus();

    // Tell the server your username
    socket.emit('add user', username);
  }
}

// Prevents input from having injected markup
function cleanInput(input) {
  return $('<div/>').text(input).text();
}

// Log a message
function log(message) {
  var $logInfo = $('<li>').text(message);
  displayMessage($logInfo);
}

// Add a log information to the chat
function displayMessage(message) {
  var $message = $(message);

  $messages.append($message);
  $messages[0].scrollTop = $messages[0].scrollHeight;
}

// Sends a chat message
function sendMessage() {
  var message = $inputMessage.val();
  // Prevent markup from being injected into the message
  message = cleanInput(message);
  // if there is a non-empty message and a socket connection
  if (message && connected) {
    $inputMessage.val('');
    // tell server to execute 'new message' and send along one parameter
    socket.emit('chat message', message);
  }
}

// Adds the visual chat message to the message list
function addChatMessage(data) {
  // Don't display the message if 'X was typing' already exists
  var $typingMessages = getTypingMessages(data);
  if ($typingMessages.length !== 0) {
    $typingMessages.remove();
  }

  var typingClass = data.typing ? 'typing' : '';
  var $message = $('<li class="message"/>').data('username', data.username).addClass(typingClass).text(data.username + ':' + data.message);
  displayMessage($message);
}

// Updates the typing event
function updateTyping() {
  if (connected) {
    if (!typing) {
      typing = true;
      socket.emit('typing');
    }
    lastTypingTime = (new Date()).getTime();

    setTimeout(function () {
      var typingTimer = (new Date()).getTime();
      var timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
        socket.emit('stop typing');
        typing = false;
      }
    }, TYPING_TIMER_LENGTH);
  }
}

// Adds the visual chat typing message
function addChatTyping(data) {
  data.typing = true;
  data.message = 'is typing';
  addChatMessage(data);
}

// Removes the visual chat typing message
function removeChatTyping(data) {
  getTypingMessages(data).fadeOut(function () {
    $(this).remove();
  });
}

// Gets the 'X is typing' messages of a user
function getTypingMessages(data) {
  return $('.typing.message').filter(function (i) {
    return $(this).data('username') === data.username;
  });
}


/*
 * Events
 */

// Focus input when clicking anywhere on login page
$loginPage.click(function() {
  $currentInput.focus();
});

// Focus input when clicking on the message input's border
$inputMessage.click(function() {
  $inputMessage.focus();
});

// Handler on inputMessage - if someone is typing
$inputMessage.on('input', function() {
  updateTyping();
});

// Keyboard events

$window.keydown(function(event) {
  // Auto-focus the current input when a key is typed
  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    $currentInput.focus();
  }
  // When the client hits ENTER on their keyboard
  if (event.which === 13) {
    if (username) {
      sendMessage();
    } else {
      setUsername();
    }
  }
});

$('.login-submit').click(function(){
  if (username) {
    sendMessage();
  } else {
    setUsername();
  }
});


/*
 * Socket events
 */

// Whenever the server emits 'login', log the login message
socket.on('login', function(data) {
  connected = true;
  // Display the welcome message
  var message = "Welcome to Socket.IO Chat – ";
  log(message);
});

// Whenever the server emits 'user joined', log it in the chat body
socket.on('user joined', function(data) {
  log(data.username + ' joined');
});

socket.on('chat message', function(data){
  addChatMessage(data);
});

// Whenever the server emits 'typing', show the typing message
socket.on('typing', function(data) {
  addChatTyping(data);
});

// Whenever the server emits 'stop typing', kill the typing message
socket.on('stop typing', function(data) {
  removeChatTyping(data);
});

 // Whenever the server emits 'user left', log it in the chat body
socket.on('user left', function(data) {
  log(data.username + ' left');
});