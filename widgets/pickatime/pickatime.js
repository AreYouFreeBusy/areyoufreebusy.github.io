//------------------------------------------------------------------------------
// Copyright (C) BizLogr Inc. All rights reserved.
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// pick-a-time/button.js
//  Handles third-party button integration (to be loaded by the client)
//------------------------------------------------------------------------------

// constants used internally
pickatime.constants = {
    rootUrlRelative: "/pick-a-time",
    responseTypes: {
      suggestions: "SET_AVAILABILITY"
    },
    hosts: {
      web_local: "https://localhost.freebusy.io:49506",
      api_local: "https://apidev.freebusy.io",
      web_prod: "https://freebusy.io",
      api_prod: "https://api.freebusy.io"
    }
}

// intialize proposal object to be set by client
pickatime.proposal = {
    subject: "", // optional
    location: "", // optional
    organizer: "", // required
    durationInMin: 0, //required
    attendees: [] //required
}

// private variables
var host = getHost();
var button = document.getElementById("freebusy-button");

// call init on script load
this.addEventListener('load', init, false);

/*
* Private methods
*/

function init() {

  // inject the CSS file
  var css = document.createElement('link');
  css.href = host + '/content/pick-a-time/button.css';
  css.type = "text/css";
  css.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(css);

  // set up the button
  button = document.getElementById("freebusy-button");
  button.addEventListener('click', pickatime.clicked, false);
  button.innerHTML = "<img src='" + host + "/content/icons/freebusy-icon-white-32x32.png'/> Pick a time</a>";
  //button.setAttribute("type","button");
  //button.disabled = true;

}

function getHost() {
  return (window.location.href.indexOf(pickatime.constants.hosts.web_local) > -1)
    ? pickatime.constants.hosts.web_local
    : pickatime.constants.hosts.web_prod;
}

function isProposalValid(){
    return false;
}

function getPickATimeUrl() {
  var url = getHost() +  "/pick-a-time/";
  /*if (metadata != null && typeof metadata === 'object') {
    if (!('organizer' in metadata)) throw new Error("Metadata object does not contain organizer.");
    var owner = metadata.organizer.email;
    url += encodeURI(owner);
    var query = "";
    if (('title' in metadata)) {
      query += (query === "") ? "?" : "&";
      query += "title=" + metadata.title;
    }
    if (('location' in metadata)) {
      query += (query === "") ? "?" : "&";
      query += "location=" + metadata.location;
    }
    if (!('durationInMin' in metadata)) throw new Error("Metadata object does not contain durationInMin.");
    query += (query === "") ? "?" : "&";
    query += "durationInMin=" + metadata.durationInMin;

    if (!('attendees' in metadata)) throw new Error("Metadata object does not contain attendees.");
    if (typeof metadata.attendees === 'string' && metadata.attendees.indexOf(',') > -1) {
      var emails = metadata.attendees.split(',');
      for (var i = 0; i < emails.length; i++) {
        query += "&attendee=" + encodeURI(emails[i]);
      }
    }
    else if (typeof metadata.attendees === 'object') {
      for (var i = 0; i < metadata.attendees.length; i++) {
        query += "&attendee=" + encodeURI(metadata.attendees[i].email);
      }
    }
    else {
      throw new Error("Attendees format not recognized. Use an array of objects or a comma-separated list of emails.");
    }

    url += encodeURI(query);
    return url;
  }
  else {
    throw new Error("Metadata parameter not an object.");
  }*/
}

/*
* Private method executed on button click event
*/
pickatime.clicked = function () {
  
  // call method on client side if proposal has not been set
  if(!isProposalValid())
    pickatime.setProposal();

  var url = getPickATimeUrl();
  
  window.open(url, 'FreeBusy Scheduling Assistant', 'width=768,height=550');
  window.addEventListener("message", pickatime.receiveMessage, false);
}

/*
* Private method executed on message received event
*/
pickatime.receiveMessage = function(event) {
  if (event.origin.indexOf(host) === -1) {
    console.log('pick-a-time event origin invalid.');
    return;
  }

  if (!event.data) {
    console.log("message contains no payload.");
    return;
  }
  var message = JSON.parse(event.data);

  if (message.type === pickatime.constants.responseTypes.suggestions) {
    // Pass the message to the client
    pickatime.result(message.suggestions[0].startTime);
    window.removeEventListener("message", pickatime.receiveMessage, false);
  }
}

/*
* Public methods 
*/
pickatime.disable = function(){
    //button.setAttribute("disabled");
}

pickatime.enable = function(){
    //button.setAttribute("disabled","");
}




