/*
 * Constantes
 */

var TYPING_TIMER_LENGTH = 1000; // ms


/*
 * Variables
 */

var $window = $(window);
var $commonMessages = $('.chat-common'); // Common chat area
var $messages = $('.messages'); // Common Messages area
var $typingAction = $('.typing-action'); // Typing area
var $usernameInput = $('.username-input'); // Input for username
var $inputMessage = $('.input-message'); // Input message input box
var $loginPage = $('.login.page'); // The login page
var $chatPage = $('.chat.page'); // The chatroom page
var $onlineUsers = $('.online-users__items'); // users online area

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
    $currentInput = $inputMessage;
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
  var $logInfo = $('<li>').addClass('log').text(message);
  displayMessage($logInfo);
}

// Sends a chat message
function sendMessage() {
  var message = cleanInput($inputMessage.val());
  // if there is a non-empty message and a socket connection
  if (message && connected) {
    $inputMessage.val('');
    // tell server to execute 'new message' and send along one parameter
    socket.emit('chat message', message);
    socket.emit('stop typing');
    typing = false;
  }
}

// Adds the visual chat message to the message list
function addChatMessage(data) {
  var $usernameDiv = $('<span class="message__username"/>')
    .text(data.username);
  var $messageBodyDiv = $('<span class="message__body">')
    .text(data.message);
  var $message = $('<li class="message"/>')
    .append($usernameDiv, $messageBodyDiv);
  displayMessage($message);
}

// Add a log information to the chat
function displayMessage(message) {
  var $message = $(message).hide().fadeIn(300);
  $messages.append($message);
  $messages[0].scrollTop = $messages[0].scrollHeight;
}

// Init privates chats for users onlines
function initPrivatesChats(data) {
  if ($('.chat-private').length) {
    $('.chat-private').remove();
  }
  for (var i in data.onlineUsers) {
    createPrivateChat(i);
  }
}

// Add private chat for new user online
function addPrivateChat(data) {
  createPrivateChat(data.addOnlineUser);
}

// Create prive chat
function createPrivateChat(data) {
  var privateMessagesArea = $('<ul class="messages-private"/>');
  var typingUsersArea = $('<ul class="typing-action-private"/>');
  var footerPrivateChat = $('<div class="chat__footer chat__footer--private"/>')
    .append('<input class="input-message" placeholder="Type here…"/>', '<button type="button" class="submit-message">Send</button>');

   var $createPrivateChat = $('<section class="chat-private"/>')
    .data('socket-id', data)
    .append(privateMessagesArea, typingUsersArea, footerPrivateChat);

    $chatPage.append($createPrivateChat);
}

// Online users when user logged in
function onlineUsers(data) {
  $onlineUsers.empty();
  $onlineUsers
    .append($('<li class="online-users__room"/>')
    .append('<span class="online-users__item--status"></span> Room commune'))
    .hide()
    .fadeIn(300);

  for (var i in data.onlineUsers) {
    $onlineUsers
      .append($('<li class="online-users__item"/>')
      .data('socket-id', i)
      .append('<span class="online-users__item--status"></span>' + data.onlineUsers[i]))
      .hide()
      .fadeIn(300);
  }
}

// add online user
function addOnlineUser(data) {
  $onlineUsers
    .append($('<li class="online-users__item"/>')
    .data('socket-id', data.addOnlineUser)
    .append('<span class="online-users__item--status"></span>' + data.username))
    .hide()
    .fadeIn(300);
}

// Remove online user
function removeOnlineUser(data) {
  $(".online-users__item").each(function(index) {
    if ($(this).data('socket-id') == data.removeOnlineUser) {
      $(this).fadeOut(function(){
        $(this).remove();
      });
    }
  });
}

// Update the typing event
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

// update users who are typing
function updateUsersWhoAreTyping(data) {
  var usersTyping = data.usersTyping;
  switch (true) {

    case usersTyping.length == 1:
      var $messageBodyDiv = usersTyping.toString() + ' is typing';
      var $message = $('<li class="typing-users"/>')
        .append($messageBodyDiv);
      displayUsersWhoAreTyping($message);
      break;

    case usersTyping.length > 1:
      var $messageBodyDiv = usersTyping.join(' and ') + ' are typing';
      var $message = $('<li class="typing-users"/>')
        .append($messageBodyDiv);
      displayUsersWhoAreTyping($message);
      break;

    case usersTyping.length == 0:
      nobodyIsTyping();
      break;

    default:
      var $messageBodyDiv = '';
      var $message = $('<li/>')
        .append($messageBodyDiv);
      displayUsersWhoAreTyping($message);
  }
}

// display users who are typing
function displayUsersWhoAreTyping(message) {
  var $message = $(message).hide().fadeIn(300);
  $typingAction.empty();
  $typingAction.append($message);
}
// remove item user typing
function nobodyIsTyping() {
  $('.typing-users').fadeOut(function(){
    $typingAction.empty();
  });
}
