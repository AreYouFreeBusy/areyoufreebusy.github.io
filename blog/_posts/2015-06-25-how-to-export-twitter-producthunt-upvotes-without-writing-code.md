---
layout: post
title: "How to export Twitter usernames of people who upvoted on ProductHunt without writing code"
description: "Learn how to export Twitter usernames of people who upvoted on ProductHunt without writing code"
keywords: "Twitter, ProductHunt, Export, Upvotes"
author: Stefan
date: 2015-06-25
---
  <div class="row">
    <div class="col-md-7">
      <p>Startups launching new products live or die by the enthusiasm and retention of their early adopters (don't I know it!). So naturally, when my startup was featured on ProductHunt, I wanted to make sure that I stay in touch with everyone who likes our product.<!--more--></p>
      <p>Unfortunately, getting a list of the people who upvoted your product isn't easy and the official word is that you have to use the ProductHunt API. I'm all for the API, but I needed something in a pinch for a campaign we were working on so I came up with a hack that uses screen scraping techniques until someone finds the time to write a proper tool.</p>
      <p></p>
      <p><iframe width="560" height="315" src="https://www.youtube.com/embed/AKWiNw62yDM" frameborder="0" allowfullscreen="allowfullscreen"></iframe></p>
      <p>Here are the steps demoed in the above video:</p>
      <ol>
        <li>Go to your ProductHunt page like <a href="http://www.producthunt.com/tech/freebusy">http://www.producthunt.com/tech/freebusy</a></li>
        <li>Ensure that upvotes data is loaded into your browser by using the scroll arrows for the upvotes list to scroll through the entire list</li>
        <li>If you're using Firefox bring up Firebug, if you're using Chrome or Internet Explorer bring up Developer Tools (F12 key works as a shortcut on Windows)</li>
        <li>Use the element selector to hover over the list of upvotes</li>
        <li>Copy the HTML of the upvotes list elements</li>
        <li>Paste into text editor (Sublime Text, Notepad++, or any other that supports find by regex)</li>
        <li>Use Find all with this regular expression:
        <pre>href="/@\w+"</pre>
        </li>
        <li>Copy find results into new file</li>
        <li>Use Find and Replace to strip the leading
        <pre>href="/</pre>
        and the trailing
        <pre>"</pre>
        </li>
        <li>You now have Twitter usernames for the people who upvoted your product</li>
      </ol>
    </div>
    <div class="col-md-4 col-md-offset-1">
      <blockquote class="twitter-tweet" data-conversation="none" data-cards="hidden" lang="en">
        <p dir="ltr" lang="en"><a href="https://twitter.com/andreasklinger">@andreasklinger</a> <a href="https://twitter.com/ProductHunt">@ProductHunt</a> hi, it's unclear from <a href="https://t.co/45kWapDZ1L">https://t.co/45kWapDZ1L</a> the state of export to csv. I'd like to export my votes. Thanks</p>
        &mdash; Stefan Negritoiu (@stefann42) <a href="https://twitter.com/stefann42/status/610631021600464896">June 16, 2015</a>
      </blockquote>
      <blockquote class="twitter-tweet" data-conversation="none" data-cards="hidden" lang="en">
        <p dir="ltr" lang="en"><a href="https://twitter.com/stefann42">@stefann42</a> Hey, you can grab all of your votes with <a href="https://t.co/cNxBJYo772">https://t.co/cNxBJYo772</a> :) <a href="https://twitter.com/andreasklinger">@andreasklinger</a> <a href="https://twitter.com/ProductHunt">@ProductHunt</a></p>
        &mdash; Mike Coutermarsh (@mscccc) <a href="https://twitter.com/mscccc/status/610634562234884096">June 16, 2015</a>
      </blockquote>
      <blockquote class="twitter-tweet" lang="en">
        <p dir="ltr" lang="en"><a href="https://twitter.com/stefann42">@stefann42</a> we do the csv export manually for ppl &amp; it needs some work. api would be faster right now :) sry <a href="https://twitter.com/andreasklinger">@andreasklinger</a> <a href="https://twitter.com/ProductHunt">@ProductHunt</a></p>
        &mdash; Mike Coutermarsh (@mscccc) <a href="https://twitter.com/mscccc/status/610636296143400960">June 16, 2015</a>
      </blockquote>
      <script src="//platform.twitter.com/widgets.js"></script>
    </div>
  </div>
