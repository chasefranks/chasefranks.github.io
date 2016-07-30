---
layout: post
title:  "A ThreadPoolExecutor Gotcha"
date:   2016-07-21
categories: Spring Spring-Integration ThreadPoolExecutor
intro: >
  I recently wrote a service that utilized a `@ServiceActivator` and `ThreadPoolExecutor` to poll a Redis queue for
  tasks. I ran into an interesting error (interesting to me at least), and would like to share what I learned here
  to help others.
---
{{ page.intro }}

To explain a service activator, let's start with a simple Java method that prints a string:

{% highlight java %}
public static void printString(String message) {
  System.out.println("Got it: " + message);
}
{% endhighlight %}

In a real-world setting, you can imagine this method does something more valuable. What we would like to do is expose
our printString method as a service. A message String can be sent over the network by a client of our service, and we
want to be able to invoke our method with the sent message.
