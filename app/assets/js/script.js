$(function(){

  /*
   * Constantes
   */

  var TYPING_TIMER_LENGTH = 1000; // ms


  /*
   * Variables
   */

  var $window = $(window);
  var $messages = $('.messages'); // Messages area
  var $typingAction = $('.typing-action'); // Typing area
  var $usernameInput = $('.username-input'); // Input for username
  var $inputMessage = $('.input-message'); // Input message input box
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
    var $message = $(message);
    $messages.append($message);
    $messages[0].scrollTop = $messages[0].scrollHeight;
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

      default:
        var $messageBodyDiv = '';
        var $message = $('<li/>')
          .append($messageBodyDiv);
        displayUsersWhoAreTyping($message);
    }
  }

  // display users who are typing
  function displayUsersWhoAreTyping(message) {
    var $message = $(message);
    $typingAction.empty();
    $typingAction.append($message);
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

  // handler on submit login button
  $('.login-submit').click(function(){
      setUsername();
  });

  $('.submit-message').click(function(){
    $currentInput.focus();
    sendMessage();
  });

  // hadler on focus & foucusout input for mobile devices
  $inputMessage.focus(function(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      $messages.addClass('messages--mobile');
    }
  });
  $inputMessage.focusout(function(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      $messages.removeClass('messages--mobile');
    }
  });

  /*
   * Socket events
   */

  // Whenever the server emits 'login', log the login message
  socket.on('login', function(data) {
    connected = true;
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function(data) {
    log(data.username + ' joined the chat');
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
  });

});