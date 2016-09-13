$( document ).ready(function() {
    
    var pluginHostUrl = 'http://localhost';
    var pluginWindow;

    window.addEventListener("message", receiveMessage, false);

    // Called
    function receiveMessage(event) {

      // Do we trust the sender of this message?
      if (event.origin !== pluginHostUrl){
        console.log('Plugin host event origin invalid: ' + event.origin);
        return;
      }

      // Set the reference to the plugin window
      pluginWindow = event.source;

      // TODO: Check message type
      // TODO: Do something with the message

      console.log('Message received from plugin: ' + event.data);


      pluginWindow.postMessage('Handshake successful.', pluginHostUrl);
    }
    
    function sendMessage() {
      pluginWindow.postMessage('Sending date selected from pick-a-time...', pluginHostUrl);
    }
});
