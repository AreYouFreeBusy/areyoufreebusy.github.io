$(document).ready(function() {
    /*$('#modalPickATime1').on('show.bs.modal', function (event) {
        console.log('Clicked open modal option 1...' + event);
    });*/

    // https://freebusy.io/pick-a-time
    var pickATimeUrl = 'http://localhost:3000';

    // following variable should be passed from the plugins host (ie https://www.gotomeeting.com/)
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
        //console.log('Clicked open window option 2...');
        //var pickATimeWindow  = window.open('https://freebusy.io/pick-a-time/m.heath66@gmail.com', 'newWindow','width=768,height=550');
        pickATimeWindow  = window.open(pickATimeUrl, 'freebusy');
        interval = setInterval(sendHandshakeMessage, 1000);

    });

    function sendHandshakeMessage(){
        //var messageType = JSON.parse(handshakeMessage);
        //console.log(messageType.messageType);

        pickATimeWindow.postMessage(JSON.parse(handshakeMessage), pickATimeUrl);
        console.log('sendHandshakeMessage');

        window.clearInterval(interval);
    }

    function sendAttendeesMessage(){
        pickATimeWindow.postMessage(JSON.parse(attendeesMessage), pickATimeUrl);
    }
    /*$('#modalPickATime2').on('show.bs.modal', function (event) {
        console.log('Clicked open modal option 3...' + event);
        $(event.target).find('.modal-body').load('https://freebusy.io/pick-a-time');
    });*/

    function receiveMessage(event){
        // Do we trust the sender of this message?  (might be
        // different from what we originally opened, for example).
        if (event.origin !== pickATimeUrl){
            console.log('Pick-A-Time event origin invalid.');
            return;
        }

        // TODO: Check message type
        console.log('messageType: ' + getMessageType(handshakeMessage));

        // TODO: Do something with the message
        // if handshake confirm, clearInterval, sendAttendeesMessage
        


        // Send the attendees
        console.log('messageType: ' + getMessageType(attendeesMessage));

        //sendAttendeesMessage();

    }

    function getMessageType(message){
        var message = JSON.parse(message);
        console.log(message);
        return message.messageType;
    }

});
