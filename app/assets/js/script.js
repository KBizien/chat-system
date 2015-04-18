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
var $currentInput = $usernameInput.focus();

var socket = io();

/*
 * Functions
 */

 // Sets the client's username
function setUsername () {
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
function cleanInput (input) {
  return $('<div/>').text(input).text();
}

// Add a participant
function addParticipantsMessage(data) {
  var message = '';
  if (data.numUsers === 1) {
    message += "there's 1 participant";
  } else {
    message += "there are " + data.numUsers + " participants";
  }
  log(message);
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
function sendMessage () {
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
function addChatMessage (data) {
  var $message = $('<li>').text(data.username + ':' + data.message);
  displayMessage($message);
}

/*
 * Events
 */

// Focus input when clicking anywhere on login page
$loginPage.click(function () {
  $currentInput.focus();
});

// Focus input when clicking on the message input's border
$inputMessage.click(function () {
  $inputMessage.focus();
});

// Keyboard events

$window.keydown(function (event) {
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

/*
 * Socket events
 */

// Whenever the server emits 'login', log the login message
socket.on('login', function(data) {
  connected = true;
  // Display the welcome message
  var message = "Welcome to Socket.IO Chat – ";
  log(message);
  addParticipantsMessage(data);
});

// Whenever the server emits 'user joined', log it in the chat body
socket.on('user joined', function(data) {
  log(data.username + ' joined');
  addParticipantsMessage(data);
});

socket.on('chat message', function(data){
  addChatMessage(data);
});

 // Whenever the server emits 'user left', log it in the chat body
socket.on('user left', function (data) {
  log(data.username + ' left');
  addParticipantsMessage(data);
});