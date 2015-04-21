/*
 * Events
 */

// Focus input when clicking anywhere on login page
$loginPage.click(function() {
  $currentInput.focus();
});

// Focus input when clicking on the message input's border
$currentInput.click(function() {
  $currentInput.focus();
});

// Handler on input - if someone is typing

$('input').on('input', function() {
  if ($(this).hasClass('input-message')) {
    updateTyping();
  }
  else {
    updateTyping();
  }
});

// Keyboard events
$window.keydown(function(event) {
  // Auto-focus the current input when a key is typed
  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    $currentInput.focus();
  }

  // When the client hits ENTER on their keyboard
  if (event.which === 13) {
    switch(true) {
      case username && $currentInput.hasClass('input-message'):
        sendMessage('common-message');
        break;
      case username && currentInput.hasClass('input-message-private'):

        break;
      default:
        setUsername();
    }
    $currentInput.focus();
  }
});

// handler on submit login button
$('.login-submit').click(function(){
    setUsername();
});

$('.btn-send').click(function(){
  $currentInput.focus();
  switch(true) {
    case username && $currentInput.hasClass('input-message'):
      sendMessage('common-message');
      break;
    case username && currentInput.hasClass('input-message-private'):

      break;
    default:
      setUsername();
  }
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

// handler on icon-users for display online users on mobile
$('.chat__header .icon-users').click(function() {
    $('.online-users-mobile').animate({width:'toggle'},400);
});

$(document).click(function(event) {
  if(!$(event.target).closest('.chat__header .icon-users, .online-users-mobile').length) {
    if($('.online-users-mobile').is(":visible")) {
      $('.online-users-mobile').animate({width:'toggle'},400);
    }
  }
});

// handler for chat links
$('body').on('click', '.online-users__room', function() {
  $('.chat-private').hide();
  $commonMessages.hide().fadeIn(300);
  $currentInput = $inputMessage;
});

$('body').on('click', '.online-users__item', function() {
  var socketId = $(this).data('socket-id');

  if ($('.chat-common').is(':visible')) {
    $commonMessages.fadeOut(300);
  }
  else {
    $('.chat-private').fadeOut(300);
  }

  $('.chat-private').each(function(index) {
    if ($(this).data('socket-id') == socketId) {
      $(this).hide().fadeIn(300);
      $currentInput = $(this).find('.input-message-private');
    }
  });
});
