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
function log(data) {
  var $logInfo = $('<li>').addClass('log').text(data.message);
  displayMessage($logInfo, data.type);
}

// Sends a chat message
function sendMessage(data) {
  var message = cleanInput($currentInput.val());

  // if there is a non-empty message and a socket connection
  if (message && connected) {
    $currentInput.val('');
    // tell server to execute 'new message' and send along one parameter
    socket.emit('chat message', {message: message, socket: data});
    socket.emit('stop typing', data);
    typing = false;
  }
}

// Adds the visual chat message to the message list
function createChatMessage(data) {
  var $usernameDiv = $('<span class="message__username"/>')
    .text(data.username);
  var $messageBodyDiv = $('<span class="message__body">')
    .text(data.message);
  var $message = $('<li class="message"/>')
    .append($usernameDiv, $messageBodyDiv);
  displayMessage($message, data.type, data.socketId);
}

// Add a log information to the chat
function displayMessage(message, type, socketId) {
  var $message = $(message).hide().fadeIn(300);
  if (type == 'common-message') {
    $messages.append($message);
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }
  else if (type == 'log-message') {
    $('.messages-area').append($message);
    $('.messages-area')[0].scrollTop = $('.messages-area')[0].scrollHeight;
  }
  else {
    $('.chat-private').each(function(index) {
      if ($(this).data('socket-id') == socketId) {
        $(this).children('.messages-private').append($message);
        $(this).children('.messages-private')[0].scrollTop = $(this).children('.messages-private')[0].scrollHeight;
      }
    });
  }
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
  var privateMessagesArea = $('<ul class="messages-private messages-area"/>');
  var typingUsersArea = $('<ul class="typing-action-private"/>');
  var footerPrivateChat = $('<div class="chat__footer chat__footer--private"/>')
    .append('<input class="input-message-private" placeholder="Type here…"/>', '<button type="button" class="btn-send submit-message-private">Send</button>');

   var $createPrivateChat = $('<section class="chat-private chat-area"/>')
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
    .append('<span class="online-users__item--status"></span>' + data.username)
    .hide()
    .fadeIn(300));
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
function updateTyping(data) {
  if (connected) {
    if (!typing) {
      typing = true;
      socket.emit('typing', data);
    }
    lastTypingTime = (new Date()).getTime();

    setTimeout(function () {
      var typingTimer = (new Date()).getTime();
      var timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
        socket.emit('stop typing', data);
        typing = false;
      }
    }, TYPING_TIMER_LENGTH);
  }
}

// update users who are typing
function updateUsersWhoAreTyping(data) {
  if (data.type == 'common-message') {
    var usersTyping = data.usersTyping;
    switch (true) {

      case usersTyping.length == 1:
        var $messageBodyDiv = usersTyping.toString() + ' is typing';
        var $message = $('<li class="typing-users"/>')
          .append($messageBodyDiv);
        displayUsersWhoAreTyping($message, data.type, data.socketId);
        break;

      case usersTyping.length > 1:
        var $messageBodyDiv = usersTyping.join(' and ') + ' are typing';
        var $message = $('<li class="typing-users"/>')
          .append($messageBodyDiv);
        displayUsersWhoAreTyping($message, data.type, data.socketId);
        break;

      case usersTyping.length == 0:
        nobodyIsTyping(data.type, data.socketId);
        break;

      default:
        var $messageBodyDiv = '';
        var $message = $('<li/>')
          .append($messageBodyDiv);
        displayUsersWhoAreTyping($message, data.type, data.socketId);
    }
  }
  else {
    if (data.id == 'typing') {
      var $messageBodyDiv = data.username + ' is typing';
      var $message = $('<li class="typing-users"/>')
        .append($messageBodyDiv);
      displayUsersWhoAreTyping($message, data.type, data.socketId);
    }
    else {
      nobodyIsTyping(data.type, data.socketId);
    }
  }
}

// display users who are typing
function displayUsersWhoAreTyping(message, type, socketId) {
  var $message = $(message).hide().fadeIn(300);
  if (type == 'common-message') {
    $typingAction.empty();
    $typingAction.append($message);
  }
  else {
    $('.chat-private').each(function(index) {
      if ($(this).data('socket-id') == socketId) {
        $(this).children('.typing-action-private').append($message);
      }
    });
  }
}
// remove item user typing
function nobodyIsTyping(type, socketId) {
  if (type == 'common-message') {
    $('.typing-users').fadeOut(function(){
      $typingAction.empty();
    });
  }
  else {
    $('.chat-private').each(function(index) {
      if ($(this).data('socket-id') == socketId) {
        $(this).children('.typing-action-private').children('.typing-users').fadeOut(function(){
          $(this).parent('.typing-action-private').empty();
        });
      }
    });
  }
}
