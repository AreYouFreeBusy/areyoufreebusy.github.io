$(document).ready(function() {

    // https://freebusy.io/pick-a-time
    var pickATimeUrl = 'http://localhost:3000';

    // following messages should be passed from the plugins host (ie https://www.gotomeeting.com/)
    var attendeesMessage = '{ "attendees" : [' +
        '{ "email":"m.heath66@gmail.com"},' +
        '{ "email":"michael@freebusy.io"},' +
        '{ "email":"stefan@freebusy.io"} ],' +
        '"invitee":"michael@freebusy.io",' +
        '"messageType" : "invite" }';

    var handshakeMessage = '{ "messageType" : "handshake" }';

    window.addEventListener("message", receiveMessage, false);

    var pickATimeWindow;
    var interval;

    $('#openWindow').on('click',function(event){
        pickATimeWindow  = window.open(pickATimeUrl, 'freebusy', 'width=768,height=550');
        interval = setInterval(sendHandshakeMessage, 1000);
    });

    function sendHandshakeMessage(){
        pickATimeWindow.postMessage(JSON.parse(handshakeMessage), pickATimeUrl);
    }

    function sendAttendeesMessage(){
        pickATimeWindow.postMessage(JSON.parse(attendeesMessage), pickATimeUrl);
    }

    function receiveMessage(event){
        // Do we trust the sender of this message?  (might be
        // different from what we originally opened, for example).
        if (event.origin !== pickATimeUrl){
            console.log('pick-a-time event origin invalid.');
            return;
        }

        console.log('messageType received: ' + getMessageType(event.data));

        // if handshake confirm, clearInterval, sendAttendeesMessage
        if(getMessageType(event.data) == 'handshake'){
            window.clearInterval(interval);
            sendAttendeesMessage();
        }
    }

    function getMessageType(message){
        console.log(message);
        return message.messageType;
    }

});
