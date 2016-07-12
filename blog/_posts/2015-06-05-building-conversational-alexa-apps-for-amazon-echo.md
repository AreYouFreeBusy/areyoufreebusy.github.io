---
layout: post
title: "Building Conversational Alexa Apps for Amazon Echo"
author: Stefan
date: 2015-06-05
---
<div class="row">
<div class="col-md-5">
<p><strong>TL;DR </strong>Amazon's Echo SDK doesn't provide all the building blocks necessary to build conversational apps so we came up with a design pattern to supplement the SDK. If your app is built on .NET the pattern is already baked into <a href="https://github.com/AreYouFreeBusy/AlexaSkillsKit.NET">AlexaSkillsKit.NET</a>, otherwise it's straightforward to implement in Java, node.js, Python or any other platform/language you build on.<!--more--></p>
<p>The attached demo shows a variety of scenarios, among which the conversational create event scenarios discussed below.</p>
</div>
<div class="col-md-7"><iframe src="https://www.youtube.com/embed/GNZPKB-HQwU?start=248" allowfullscreen="allowfullscreen" frameborder="0" height="315" width="560"></iframe></div>
</div>
<h2>Background</h2>
<p>As early adopters of the Alexa platform we had to do some pioneering work to figure out how to design and structure our FreeBusy Skills for Alexa. VUI (Voice User Interface) is a (relatively) new kind of user experience. There's no book to teach you how to structure your implementation, like you'd read about the MVC pattern when building Web apps or the MVVM pattern when building smartphone apps. The only "prior art" I found is <a href="http://demos.jellyvisionlab.com/downloads/The_Jack_Principles.pdf">The Jack Principles of the Interactive Conversation Interface</a>.</p>
<p>I first started thinking about how to build the the right kind of VUI interactions back when Xbox One came out. But in the case of Xbox, VUI is a secondary play (main interaction is still through an on-screen UI and there's no voice output, just input) and with the deemphasis of Kinect it might go away altogether. There are, of course, Siri for iPhone and Cortana for Windows Phone, but those are restricted to in-the-box (1<sup>st</sup> party) experiences and so no opportunity to build your own app, plus, there's still an on-screen UI to trigger and complement the VUI.</p>
<p>Echo (Alexa) is the first VUI-only general purpose programmable device and that's both exciting and challenging. Overall, it has been a joy to use and to develop for, even though it's not perfect and still at the beginning. I believe the main differentiator that will drive new user experiences is it's omnipresence: it's always there for you to talk to it. I don't have to sit on the couch, look at the TV and yell in the direction of the Xbox and I don't have to pick up my iPhone and hold it up to my mouth (perhaps not strictly necessary, but nevertheless a reflex) to talk it.</p>
<p>I could be on the floor playing with my daughter and ask it to play some music over the random noises from the toys, while my wife is unpacking groceries, half-turned around, and follows up with a request to set an alarm so I don't forget to take the roast out of the oven (it's our first year with a baby and it's rather chaotic). This spatial convenience might not apply to you if you have a 4-bedroom house, but I don't think Amazon is far off from a multi-device solution for a large household. You could use multiple devices today, but there's no coordination so that one and only one device acts on your request.</p>
<p>This omnipresence makes it possible to design more natural, off-the-cuff, conversational experiences, rather than the command-oriented, directed interactions that are standard for devices with screens. Which brings me to the topic at hand: conversational apps. By conversation I don't mean the kind of philosophical banter you have at 4 a.m. at Burning Man with someone dressed in a bunny suit. Rather, I mean a back-and-forth sequence of natural utterances that leads to the building of a complex command that a VUI-only device can carry out. The goal, after all, is still for you to give a command to your device. I'll leave conversations without a goal to the screenwriters of Her.</p>
<h2>Problem</h2>
<p>Since my specialty is productivity apps I'll focus on translating on-screen UIs that have text fields, checkboxes, and drop-down lists into their VUI equivalents and I'll use as an example FreeBusy for Alexa app. FreeBusy is all about group scheduling and it helps you coordinate a time for a meeting and put it on the calendar (be it Google, Office 365, iCloud, or many others that we support). When you use our app you can say:</p>
<blockquote>
<p>Alexa, ask FreeBusy to create an event for Thursday at 2 p.m.</p>
</blockquote>
<p>which yields this request from Alexa to our service (some fields redacted for brevity):</p>
<pre><code>POST /service-endpoint HTTP/1.1
Accept: application/json
Accept-Charset: utf-8
Signature: [redacted]
SignatureCertChainUrl: [redacted]
Content-Type: application/json; charset=utf-8

{
  "version": "1.0",
  "session": {
    "new": true,
    "sessionId": "redacted",
    "application": {
      "applicationId": "redacted"
    },
    "user": {
      "userId": "redacted"
    }
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "redacted",
    "timestamp": "2015-06-01T23:06:57Z",
    "intent": {
      "name": "createEvent",
      "slots": {
        "forDate": {
          "name": "forDate",
          "value": "2015-06-04"
        },
        "startTime": {
          "name": "startTime",
          "value": "14:00"
        },
      }
    }
  }
}
</code></pre>
<p>You can see that Alexa maps the utterance to an intent named <em>createEvent</em> with slots <em>forDate</em> and <em>startTime</em>. My task would have ended here if creating an event would only require a date and time. But to be useful, I would like to include a duration, a topic, perhaps even a location. To be even more useful I would like to invite one or more people. That becomes:</p>
<blockquote>
<p>Alexa, ask FreeBusy to create an event for Thursday at 2 p.m. for 45 minutes regarding weekly team sync in conference room Bethesda with Michael, Cristi, and Brin.</p>
</blockquote>
<p>Wow, that's a mouthful! No one says all of that in a single utterance especially with the diction and cadence required by today's voice recognition technology: don't make long pauses! articulate! don't smirk! stand up straight! Ok, that last one isn't a requirement for Alexa, it's just what my father would say. Even if people would be Ok to give long commands like this they won't remember the particular order in which you recognize and map to the intent slots. So you have to provide permutations of the slots. In my example I have 6 slots which makes for 6! = 720 permutations. I really do have to supply Alexa with utterances for all those permutations because the grammar changes slightly as we change the order. For instance, when we start with <em>startTime</em> we say:</p>
<blockquote>
<p>Alexa, ask FreeBusy to create an event at 2 p.m. <span style="text-decoration: line-through;">for</span>on Thursday</p>
</blockquote>
<p>720 permutations by themselves is not a lot, but remember that you have to supply many possible values for each slot to guarantee that it will be recognized correctly. So an intent with a DATE slot should supply these utterance variations (if they make sense for your app of course):</p>
<pre><code>createWithDate create event for {today|forDate}
createWithDate create event for {tomorrow|forDate}
createWithDate create event for {monday|forDate}
createWithDate create event for {tuesday|forDate}
createWithDate create event for {wednesday|forDate}
createWithDate create event for {thursday|forDate}
createWithDate create event for {friday|forDate}
createWithDate create event for {saturday|forDate}
createWithDate create event for {sunday|forDate}
createWithDate create event for {next monday|forDate}
createWithDate create event for {next tuesday|forDate}
createWithDate create event for {next wednesday|forDate}
createWithDate create event for {next thursday|forDate}
createWithDate create event for {next friday|forDate}
createWithDate create event for {next saturday|forDate}
createWithDate create event for {next sunday|forDate}
createWithDate create event for {next weekend|forDate}
createWithDate create event for {january fifth|forDate}
createWithDate create event for {january eleventh|forDate}
createWithDate create event for {january twenty third|forDate}
...
createWithDate create event for {december fifth|forDate}
createWithDate create event for {december eleventh|forDate}
createWithDate create event for {december twenty third|forDate}
</code></pre>
<p>That's 53 variations just for the DATE slot. Now my utterances file exploded to 720 * 53 = 38,160 samples. So yeah, not a practical approach! Even if generating and parsing all those utterances would be technically Ok, the command is bound to be unfulfillable because the user may have more than one Michael in their contacts so we don't know which specific Michael should be invited to the meeting. Moreso, Michael, being the troublemaker that he is, might be busy Thursday at 2 p.m. (happy hour starts early some days, what can I say).</p>
<p>So, for a multitude of reasons, we need to break down the command in a conversation with multiple shorter exchanges which eventually accumulate to give us all the needed parameters. How about this:</p>
<blockquote>
<p><span class="glyphicon glyphicon-user"></span> Alexa, ask FreeBusy to schedule a meeting for Thursday at 2 p.m.<br><span class="glyphicon glyphicon-volume-up"></span> Ok, how long do you want the meeting to be?<br><span class="glyphicon glyphicon-user"></span> 45 minutes<br><span class="glyphicon glyphicon-volume-up"></span> Ok, but you have a conflict at 2:30 p.m. titled catch up over coffee with Dan Marino. Do you still want to schedule a new meeting?<br><span class="glyphicon glyphicon-user"></span> Yes<br><span class="glyphicon glyphicon-volume-up"></span> Ok, what's the topic for this event?<br><span class="glyphicon glyphicon-user"></span> Weekly team sync <br><span class="glyphicon glyphicon-volume-up"></span> Ok, who should I invite to weekly team sync? <br><span class="glyphicon glyphicon-user"></span> Michael, Cristi, and Brin<br><span class="glyphicon glyphicon-volume-up"></span> Which Michael? Michael Heather or Michael Cerney <br><span class="glyphicon glyphicon-user"></span> Michael Cerney <br><span class="glyphicon glyphicon-volume-up"></span> Ok, but it looks like Michael Cerney is busy at that time. Should I not schedule the meeting or should I not invite Michael Cerney?<br><span class="glyphicon glyphicon-user"></span> Don't invite Michael <br><span class="glyphicon glyphicon-volume-up"></span> Ok, I created an event for Thursday at 2 p.m. titled weekly sync meeting and I invited Cristi and Brin.</p>
</blockquote>
<p>So much more natural! I can see myself having this conversation while sipping my coffee or reading the newspaper, er... I mean Twitter. When we started implementation however, we faced two technical problems: how to keep track of inputs we've been given and how to keep track of where we are in the conversation (by which I mean which intents have been uttered and in what sequence because there are multiple branches and the request could be abandoned without creating a meeting).</p>
<p>Now, Alexa SDK offers a session object present in the request and response payloads which you can use to track state while still building a stateless service on your side. And we did try to use it according to the SDK samples but it yields unmaintainable, spaghetti code. Two realities make Session by itself unsuitable:</p>
<ol>
<li>
<p>A single intent with an open literal slot serves to collect input of the meeting topic ("weekly team meeting") and input of the attendees ("Michael, Cristi, Brin") and that single intent is used in multiple conversations.</p>
</li>
<li>
<p>A single intent that captures the utterance "yes" (an another one that captures "no") are used multiple times in the conversation (and across different conversations) and their use will have very different consequences depending where in the conversation they are uttered.</p>
</li>
</ol>
<p>This is why we came up with two higher level concepts that build on the session object and make it easy to build conversational apps.</p>
<h3>Solution</h3>
<p><strong>Conversation Object Model</strong></p>
<p>I propose we formally define a conversation as an ordered sequence of intents. Much like intents have slots which effectively define the intent object model, conversations shall also have an associated object model. The meaning of the object model is "conversation needs these pieces of data to carry out the command". In the case of FreeBusy <em>scheduleGroupMeeting</em> conversation needs:</p>
<pre><code>{
  "forDate": "2015-06-04",
  "startTime": "14:00",
  "duration": "PT45M",
  "subject": "weekly team meeting",
  "location": "Bethesda conference room",
  "guestFirstName": "Michael",
  "guestLastName": "Cerney"
}
</code></pre>
<p>(<em>I kept it simple by having a single attendee and assumed that the first and last name uniquely identify that attendee. My use of JSON syntax is meant only as pseudo-code; in reality you'd write this out as a class or object definition specific to your your server-side language.</em>)</p>
<p>The field names match the slots names in the intents that participate in this conversation. This design has the useful consequence that it decouples the sample utterances from the implementation of the conversation. As long as you don't change the slot names you can move slots between intents, you can change the order in which the user can utter them, you can even introduce new intents that capture the slots in a completely different manner.</p>
<p>To show you how flexible the design is, we got feedback from Beta testers that it would be useful to also support collecting <em>forDate</em> and <em>startTime</em> in two separate utterances like this:</p>
<blockquote>
<p>Alexa, ask FreeBusy to schedule a meeting for Thursday <br>Ok, at what time should the meeting be on Thursday? <br>At 2 p.m.</p>
</blockquote>
<p>We were able to accommodate this ask <strong>without changing of single line of server-side code</strong>. All we did was add the additional intent and corresponding utterances that capture the already defined slots in a new sequence.</p>
<p><strong>Session Management</strong></p>
<p>A linear conversation doesn't care in what order its object model is filled by utterances and shouldn't concern itself that an IntentRequest might bring part of the fields in its Slots payload and other fields in its Session payload. All it cares about is "do I have everything I need to carry out this command?". So to make it simple, I added to AlexaAppKit.NET session management which simply copies all the slot values present in the Slots object to the Session object on every IntentRequest. This way the conversation only needs to check the Session object. The assumption is that if your app is handling multiple IntentRequests within a single session, this behavior will help you not cause you problems, but you can opt out if you don't like it.</p>
<p><strong>Intent Sequence</strong></p>
<p>What about non-linear conversations where "yes" and "no"s cause branching and different outcomes? I felt the need to formalize the sequence of intents throughout the session so when the app receives an IntentRequest is not only knows the current intent name but also the first intent that started the conversation and what other intents have been uttered prior to the current one.</p>
<p>To make that logic simple I added to AlexaAppKit.NET auto-tracking of intent sequence using a hard-coded session variable. The library parses the session variable during each request and exposes the data to the Speechlet as an array of intent names.</p>
<p>Let's put it all together and see what the conversation above looks like (focus on the Session object because that's where the action has now moved to):</p>
<div class="row">
<div class="col-md-6">
<p>Request 1:</p>
<pre><code>POST /service-endpoint HTTP/1.1
Content-Type: application/json; charset=utf-8

{
  "session": {
    "new": true,
  },
  "request": {
    "type": "IntentRequest",
    "intent": {
      "name": "createEvent",
      "slots": {
        "forDate": {
          "name": "forDate",
          "value": "2015-06-04"
        },
        "startTime": {
          "name": "startTime",
          "value": "14:00"
        },
      }
    }
  }
}
</code></pre>
</div>
<div class="col-md-6">
<p>Response 1:</p>
<pre><code>HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "response": {
    "outputSpeech": {
      "type": "PlainText",
      "text": "Ok, How long do you want the event to be?"
    },
    "shouldEndSession": false
  },
  "sessionAttributes": {
    "intentSequence": "createEvent",
    "forDate": "2015-06-04",
    "startTime": "14:00"
  }
}
</code></pre>
</div>
</div>
<div class="row">
<div class="col-md-6">
<p>Request 2:</p>
<pre><code>POST /service-endpoint HTTP/1.1
Content-Type: application/json; charset=utf-8

{
  "session": {
    "new": false,
    "attributes": {
      "intentSequence": "createEvent",
      "forDate": "2015-06-04",
      "startTime": "14:00"
    }
  }
  "request": {
    "type": "IntentRequest",
    "intent": {
      "name": "duration",
      "slots": {
        "duration": {
          "name": "duration",
          "value": "PT45M"
        }
      }
    }
  }
}
</code></pre>
</div>
<div class="col-md-6">
<p>Response 2:</p>
<pre><code>HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "response": {
    "outputSpeech": {
      "type": "PlainText",
      "text": "Ok, but you have a conflicting event at 2:00 PM titled coffee with Dan Marino. Do you still want to schedule another event at that time?"
    },
    "shouldEndSession": false
  },
  "sessionAttributes": {
    "intentSequence": "createEvent;duration",
    "forDate": "2015-06-04",
    "startTime": "14:00",
    "duration": "PT45M"
  }
}
</code></pre>
</div>
</div>
<div class="row">
<div class="col-md-6">
<p>Request 3:</p>
<pre><code>POST /service-endpoint HTTP/1.1
Content-Type: application/json; charset=utf-8

{
  "session": {
    "new": false,
    "attributes": {
      "intentSequence": "createEvent;duration"
      "forDate": "2015-06-04",
      "startTime": "14:00",
      "duration": "PT45M",
    }
  },
  "request": {
    "type": "IntentRequest",
    "intent": {
      "name": "YES"
    }
  }
}
</code></pre>
</div>
<div class="col-md-6">
<p>Response 3:</p>
<pre><code>HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "response": {    
    "outputSpeech": {
      "type": "PlainText",
      "text": "Ok, What's the topic for this event?"
    },
    "shouldEndSession": false
  },
  "sessionAttributes": {
    "intentSequence": "createEvent;duration;yes"
    "forDate": "2015-06-04",
    "startTime": "14:00",
    "duration": "PT45M",
  }
}
</code></pre>
</div>
</div>
<p>Note how <em>intentSequence</em> tracks each IntentRequest. In code it's exposed as a new IntentSequence array hanging off the Session object and we use it to route the request to the conversation associated with the intent that kicked it off:</p>
<pre class="brush: csharp"><code>switch (session.IntentSequence[0]) {
    case INTENT_CREATE_EVENT:
        response = ProcessCreateEventIntent(request.Intent, session);
        break;
    ...
    default:        
        response = BuildHelpResponse();
        break;
}
</code></pre>
<p>Hope this helps, enjoy!</p>
        </div>
  <div class="row">
    <div class="col-md-5">
      <p><strong>TL;DR </strong>Amazon's Echo SDK doesn't provide all the building blocks necessary to build conversational apps so we came up with a design pattern to supplement the SDK. If your app is built on .NET the pattern is already baked into <a href="https://github.com/AreYouFreeBusy/AlexaSkillsKit.NET">AlexaSkillsKit.NET</a>, otherwise it's straightforward to implement in Java, node.js, Python or any other platform/language you build on.</p>
      <p>The attached demo shows a variety of scenarios, among which the conversational create event scenarios discussed below.</p>
    </div>
    <div class="col-md-7">
      <iframe width="560" height="315" src="https://www.youtube.com/embed/GNZPKB-HQwU?start=248" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
    </div>
  </div>
  <h2>Background</h2>
  <p>As early adopters of the Alexa platform we had to do some pioneering work to figure out how to design and structure our FreeBusy Skills for Alexa. VUI (Voice User Interface) is a (relatively) new kind of user experience. There's no book to teach you how to structure your implementation, like you'd read about the MVC pattern when building Web apps or the MVVM pattern when building smartphone apps. The only "prior art" I found is <a href="http://demos.jellyvisionlab.com/downloads/The_Jack_Principles.pdf">The Jack Principles of the Interactive Conversation Interface</a>.</p>
  <p>I first started thinking about how to build the the right kind of VUI interactions back when Xbox One came out. But in the case of Xbox, VUI is a secondary play (main interaction is still through an on-screen UI and there's no voice output, just input) and with the deemphasis of Kinect it might go away altogether. There are, of course, Siri for iPhone and Cortana for Windows Phone, but those are restricted to in-the-box (1<sup>st</sup> party) experiences and so no opportunity to build your own app, plus, there's still an on-screen UI to trigger and complement the VUI.</p>
  <p>Echo (Alexa) is the first VUI-only general purpose programmable device and that's both exciting and challenging. Overall, it has been a joy to use and to develop for, even though it's not perfect and still at the beginning. I believe the main differentiator that will drive new user experiences is it's omnipresence: it's always there for you to talk to it. I don't have to sit on the couch, look at the TV and yell in the direction of the Xbox and I don't have to pick up my iPhone and hold it up to my mouth (perhaps not strictly necessary, but nevertheless a reflex) to talk it.</p>
  <p>I could be on the floor playing with my daughter and ask it to play some music over the random noises from the toys, while my wife is unpacking groceries, half-turned around, and follows up with a request to set an alarm so I don't forget to take the roast out of the oven (it's our first year with a baby and it's rather chaotic). This spatial convenience might not apply to you if you have a 4-bedroom house, but I don't think Amazon is far off from a multi-device solution for a large household. You could use multiple devices today, but there's no coordination so that one and only one device acts on your request.</p>
  <p>This omnipresence makes it possible to design more natural, off-the-cuff, conversational experiences, rather than the command-oriented, directed interactions that are standard for devices with screens. Which brings me to the topic at hand: conversational apps. By conversation I don't mean the kind of philosophical banter you have at 4 a.m. at Burning Man with someone dressed in a bunny suit. Rather, I mean a back-and-forth sequence of natural utterances that leads to the building of a complex command that a VUI-only device can carry out. The goal, after all, is still for you to give a command to your device. I'll leave conversations without a goal to the screenwriters of Her.</p>
  <h2>Problem</h2>
  <p>Since my specialty is productivity apps I'll focus on translating on-screen UIs that have text fields, checkboxes, and drop-down lists into their VUI equivalents and I'll use as an example FreeBusy for Alexa app. FreeBusy is all about group scheduling and it helps you coordinate a time for a meeting and put it on the calendar (be it Google, Office 365, iCloud, or many others that we support). When you use our app you can say:</p>
  <blockquote>
    <p>Alexa, ask FreeBusy to create an event for Thursday at 2 p.m.</p>
  </blockquote>
  <p>which yields this request from Alexa to our service (some fields redacted for brevity):</p>
  <pre><code>POST /service-endpoint HTTP/1.1
      Accept: application/json
      Accept-Charset: utf-8
      Signature: [redacted]
      SignatureCertChainUrl: [redacted]
      Content-Type: application/json; charset=utf-8

      {
        "version": "1.0",
        "session": {
          "new": true,
          "sessionId": "redacted",
          "application": {
            "applicationId": "redacted"
          },
          "user": {
            "userId": "redacted"
          }
        },
        "request": {
          "type": "IntentRequest",
          "requestId": "redacted",
          "timestamp": "2015-06-01T23:06:57Z",
          "intent": {
            "name": "createEvent",
            "slots": {
              "forDate": {
                "name": "forDate",
                "value": "2015-06-04"
              },
              "startTime": {
                "name": "startTime",
                "value": "14:00"
              },
            }
          }
        }
      }
      </code></pre>
  <p>You can see that Alexa maps the utterance to an intent named <em>createEvent</em> with slots <em>forDate</em> and <em>startTime</em>. My task would have ended here if creating an event would only require a date and time. But to be useful, I would like to include a duration, a topic, perhaps even a location. To be even more useful I would like to invite one or more people. That becomes:</p>
  <blockquote>
    <p>Alexa, ask FreeBusy to create an event for Thursday at 2 p.m. for 45 minutes regarding weekly team sync in conference room Bethesda with Michael, Cristi, and Brin.</p>
  </blockquote>
  <p>Wow, that's a mouthful! No one says all of that in a single utterance especially with the diction and cadence required by today's voice recognition technology: don't make long pauses! articulate! don't smirk! stand up straight! Ok, that last one isn't a requirement for Alexa, it's just what my father would say. Even if people would be Ok to give long commands like this they won't remember the particular order in which you recognize and map to the intent slots. So you have to provide permutations of the slots. In my example I have 6 slots which makes for 6! = 720 permutations. I really do have to supply Alexa with utterances for all those permutations because the grammar changes slightly as we change the order. For instance, when we start with <em>startTime</em> we say:</p>
  <blockquote>
    <p>Alexa, ask FreeBusy to create an event at 2 p.m. <span style="text-decoration: line-through;">for</span>on Thursday</p>
  </blockquote>
  <p>720 permutations by themselves is not a lot, but remember that you have to supply many possible values for each slot to guarantee that it will be recognized correctly. So an intent with a DATE slot should supply these utterance variations (if they make sense for your app of course):</p>
  <pre>
    <code>createWithDate create event for {today|forDate}
      createWithDate create event for {tomorrow|forDate}
      createWithDate create event for {monday|forDate}
      createWithDate create event for {tuesday|forDate}
      createWithDate create event for {wednesday|forDate}
      createWithDate create event for {thursday|forDate}
      createWithDate create event for {friday|forDate}
      createWithDate create event for {saturday|forDate}
      createWithDate create event for {sunday|forDate}
      createWithDate create event for {next monday|forDate}
      createWithDate create event for {next tuesday|forDate}
      createWithDate create event for {next wednesday|forDate}
      createWithDate create event for {next thursday|forDate}
      createWithDate create event for {next friday|forDate}
      createWithDate create event for {next saturday|forDate}
      createWithDate create event for {next sunday|forDate}
      createWithDate create event for {next weekend|forDate}
      createWithDate create event for {january fifth|forDate}
      createWithDate create event for {january eleventh|forDate}
      createWithDate create event for {january twenty third|forDate}
      ...
      createWithDate create event for {december fifth|forDate}
      createWithDate create event for {december eleventh|forDate}
      createWithDate create event for {december twenty third|forDate}
    </code>
  </pre>
  <p>That's 53 variations just for the DATE slot. Now my utterances file exploded to 720 * 53 = 38,160 samples. So yeah, not a practical approach! Even if generating and parsing all those utterances would be technically Ok, the command is bound to be unfulfillable because the user may have more than one Michael in their contacts so we don't know which specific Michael should be invited to the meeting. Moreso, Michael, being the troublemaker that he is, might be busy Thursday at 2 p.m. (happy hour starts early some days, what can I say).</p>
  <p>So, for a multitude of reasons, we need to break down the command in a conversation with multiple shorter exchanges which eventually accumulate to give us all the needed parameters. How about this:</p>
  <blockquote>
    <p><span class="glyphicon glyphicon-user"></span> Alexa, ask FreeBusy to schedule a meeting for Thursday at 2 p.m.<br /><span class="glyphicon glyphicon-volume-up"></span> Ok, how long do you want the meeting to be?<br /><span class="glyphicon glyphicon-user"></span> 45 minutes<br /><span class="glyphicon glyphicon-volume-up"></span> Ok, but you have a conflict at 2:30 p.m. titled catch up over coffee with Dan Marino. Do you still want to schedule a new meeting?<br /><span class="glyphicon glyphicon-user"></span> Yes<br /><span class="glyphicon glyphicon-volume-up"></span> Ok, what's the topic for this event?<br /><span class="glyphicon glyphicon-user"></span> Weekly team sync <br /><span class="glyphicon glyphicon-volume-up"></span> Ok, who should I invite to weekly team sync? <br /><span class="glyphicon glyphicon-user"></span> Michael, Cristi, and Brin<br /><span class="glyphicon glyphicon-volume-up"></span> Which Michael? Michael Heather or Michael Cerney <br /><span class="glyphicon glyphicon-user"></span> Michael Cerney <br /><span class="glyphicon glyphicon-volume-up"></span> Ok, but it looks like Michael Cerney is busy at that time. Should I not schedule the meeting or should I not invite Michael Cerney?<br /><span class="glyphicon glyphicon-user"></span> Don't invite Michael <br /><span class="glyphicon glyphicon-volume-up"></span> Ok, I created an event for Thursday at 2 p.m. titled weekly sync meeting and I invited Cristi and Brin.</p>
  </blockquote>
  <p>So much more natural! I can see myself having this conversation while sipping my coffee or reading the newspaper, er... I mean Twitter. When we started implementation however, we faced two technical problems: how to keep track of inputs we've been given and how to keep track of where we are in the conversation (by which I mean which intents have been uttered and in what sequence because there are multiple branches and the request could be abandoned without creating a meeting).</p>
  <p>Now, Alexa SDK offers a session object present in the request and response payloads which you can use to track state while still building a stateless service on your side. And we did try to use it according to the SDK samples but it yields unmaintainable, spaghetti code. Two realities make Session by itself unsuitable:</p>
  <ol>
    <li>
      <p>A single intent with an open literal slot serves to collect input of the meeting topic ("weekly team meeting") and input of the attendees ("Michael, Cristi, Brin") and that single intent is used in multiple conversations.</p>
    </li>
    <li>
      <p>A single intent that captures the utterance "yes" (an another one that captures "no") are used multiple times in the conversation (and across different conversations) and their use will have very different consequences depending where in the conversation they are uttered.</p>
    </li>
  </ol>
  <p>This is why we came up with two higher level concepts that build on the session object and make it easy to build conversational apps.</p>
  <h3>Solution</h3>
  <p><strong>Conversation Object Model</strong></p>
  <p>I propose we formally define a conversation as an ordered sequence of intents. Much like intents have slots which effectively define the intent object model, conversations shall also have an associated object model. The meaning of the object model is "conversation needs these pieces of data to carry out the command". In the case of FreeBusy <em>scheduleGroupMeeting</em> conversation needs:</p>
  <pre>
    <code>{
      "forDate": "2015-06-04",
      "startTime": "14:00",
      "duration": "PT45M",
      "subject": "weekly team meeting",
      "location": "Bethesda conference room",
      "guestFirstName": "Michael",
      "guestLastName": "Cerney"
    }
    </code>
  </pre>
  <p>(<em>I kept it simple by having a single attendee and assumed that the first and last name uniquely identify that attendee. My use of JSON syntax is meant only as pseudo-code; in reality you'd write this out as a class or object definition specific to your your server-side language.</em>)</p>
  <p>The field names match the slots names in the intents that participate in this conversation. This design has the useful consequence that it decouples the sample utterances from the implementation of the conversation. As long as you don't change the slot names you can move slots between intents, you can change the order in which the user can utter them, you can even introduce new intents that capture the slots in a completely different manner.</p>
  <p>To show you how flexible the design is, we got feedback from Beta testers that it would be useful to also support collecting <em>forDate</em> and <em>startTime</em> in two separate utterances like this:</p>
  <blockquote>
    <p>Alexa, ask FreeBusy to schedule a meeting for Thursday <br />Ok, at what time should the meeting be on Thursday? <br />At 2 p.m.</p>
  </blockquote>
  <p>We were able to accommodate this ask <strong>without changing of single line of server-side code</strong>. All we did was add the additional intent and corresponding utterances that capture the already defined slots in a new sequence.</p>
  <p><strong>Session Management</strong></p>
  <p>A linear conversation doesn't care in what order its object model is filled by utterances and shouldn't concern itself that an IntentRequest might bring part of the fields in its Slots payload and other fields in its Session payload. All it cares about is "do I have everything I need to carry out this command?". So to make it simple, I added to AlexaAppKit.NET session management which simply copies all the slot values present in the Slots object to the Session object on every IntentRequest. This way the conversation only needs to check the Session object. The assumption is that if your app is handling multiple IntentRequests within a single session, this behavior will help you not cause you problems, but you can opt out if you don't like it.</p>
  <p><strong>Intent Sequence</strong></p>
  <p>What about non-linear conversations where "yes" and "no"s cause branching and different outcomes? I felt the need to formalize the sequence of intents throughout the session so when the app receives an IntentRequest is not only knows the current intent name but also the first intent that started the conversation and what other intents have been uttered prior to the current one.</p>
  <p>To make that logic simple I added to AlexaAppKit.NET auto-tracking of intent sequence using a hard-coded session variable. The library parses the session variable during each request and exposes the data to the Speechlet as an array of intent names.</p>
  <p>Let's put it all together and see what the conversation above looks like (focus on the Session object because that's where the action has now moved to):</p>
  <div class="row">
    <div class="col-md-6">
      <p>Request 1:</p>
      <pre>
        <code>
        POST /service-endpoint HTTP/1.1
        Content-Type: application/json; charset=utf-8

        {
          "session": {
            "new": true,
          },
          "request": {
            "type": "IntentRequest",
            "intent": {
              "name": "createEvent",
              "slots": {
                "forDate": {
                  "name": "forDate",
                  "value": "2015-06-04"
                },
                "startTime": {
                  "name": "startTime",
                  "value": "14:00"
                },
              }
            }
          }
        }
        </code>
      </pre>
    </div>
    <div class="col-md-6">
      <p>Response 1:</p>
      <pre>
        <code>HTTP/1.1 200 OK
        Content-Type: application/json; charset=utf-8

        {
          "response": {
            "outputSpeech": {
              "type": "PlainText",
              "text": "Ok, How long do you want the event to be?"
            },
            "shouldEndSession": false
          },
          "sessionAttributes": {
            "intentSequence": "createEvent",
            "forDate": "2015-06-04",
            "startTime": "14:00"
          }
        }
        </code>
      </pre>
    </div>
  </div>
<div class="row">
<div class="col-md-6">
<p>Request 2:</p>
<pre><code>POST /service-endpoint HTTP/1.1
Content-Type: application/json; charset=utf-8

{
  "session": {
    "new": false,
    "attributes": {
      "intentSequence": "createEvent",
      "forDate": "2015-06-04",
      "startTime": "14:00"
    }
  }
  "request": {
    "type": "IntentRequest",
    "intent": {
      "name": "duration",
      "slots": {
        "duration": {
          "name": "duration",
          "value": "PT45M"
        }
      }
    }
  }
}
</code></pre>
</div>
<div class="col-md-6">
<p>Response 2:</p>
<pre><code>HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "response": {
    "outputSpeech": {
      "type": "PlainText",
      "text": "Ok, but you have a conflicting event at 2:00 PM titled coffee with Dan Marino. Do you still want to schedule another event at that time?"
    },
    "shouldEndSession": false
  },
  "sessionAttributes": {
    "intentSequence": "createEvent;duration",
    "forDate": "2015-06-04",
    "startTime": "14:00",
    "duration": "PT45M"
  }
}
</code></pre>
</div>
</div>
<div class="row">
<div class="col-md-6">
<p>Request 3:</p>
<pre><code>POST /service-endpoint HTTP/1.1
Content-Type: application/json; charset=utf-8

{
  "session": {
    "new": false,
    "attributes": {
      "intentSequence": "createEvent;duration"
      "forDate": "2015-06-04",
      "startTime": "14:00",
      "duration": "PT45M",
    }
  },
  "request": {
    "type": "IntentRequest",
    "intent": {
      "name": "YES"
    }
  }
}
</code></pre>
</div>
<div class="col-md-6">
<p>Response 3:</p>
<pre><code>HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "response": {    
    "outputSpeech": {
      "type": "PlainText",
      "text": "Ok, What's the topic for this event?"
    },
    "shouldEndSession": false
  },
  "sessionAttributes": {
    "intentSequence": "createEvent;duration;yes"
    "forDate": "2015-06-04",
    "startTime": "14:00",
    "duration": "PT45M",
  }
}
</code></pre>
</div>
</div>
<p>Note how <em>intentSequence</em> tracks each IntentRequest. In code it's exposed as a new IntentSequence array hanging off the Session object and we use it to route the request to the conversation associated with the intent that kicked it off:</p>
<pre class="brush: csharp"><code>switch (session.IntentSequence[0]) {
    case INTENT_CREATE_EVENT:
        response = ProcessCreateEventIntent(request.Intent, session);
        break;
    ...
    default:        
        response = BuildHelpResponse();
        break;
}
</code></pre>
<p>Hope this helps, enjoy!</p>

