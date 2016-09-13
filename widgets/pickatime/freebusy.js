 $( document ).ready(function() {

    var handshakeMessage = '{ "messageType" : "handshake" }';

    var origin;
    var pluginHostUrl;
    var pluginWindow;

    window.addEventListener("message", receiveMessage, false);

    // Called after event listener is registered
    function receiveMessage(event) {

      origin = event.origin || event.originalEvent.origin;

      // Do we trust the sender of this message?
      if (event.origin !== origin){
        console.log('ALERT: plugin host event origin invalid: ' + event.origin);
        return;
      }

      console.log('messageType received: ' + getMessageType(event.data));

      // Check message type
      if(getMessageType(event.data) == 'handshake'){

        // If handshake, set the reference to the plugin window and host
        pluginHostUrl = event.origin;
        pluginWindow = event.source;

        // Send confirmation
        pluginWindow.postMessage(JSON.parse(handshakeMessage), pluginHostUrl);

      }
      else if(getMessageType(event.data) == 'invite'){
        console.log('invite message received: ' + event.data);
      }
    }


    function getMessageType(message){
      return message.messageType;
    }

  });

