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
    switch(true) {
      case username && $currentInput.hasClass('input-message'):
        sendMessage();
        break;

      default:
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
  $privateChat.hide();
  $commonMessages.hide().fadeIn(300);
});

$('body').on('click', '.online-users__item', function() {
  $commonMessages.fadeOut(300);
});
