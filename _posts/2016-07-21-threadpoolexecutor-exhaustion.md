---
layout: post
title:  "A ThreadPoolExecutor Gotcha"
date:   2016-07-21
categories: Spring Spring-Integration ThreadPoolExecutor
intro: >
  I recently wrote a service that utilized a `@ServiceActivator` and `ThreadPoolExecutor` to poll a Redis queue for
  tasks. I ran into an interesting error (interesting to me at least), and would like to share what I learned here
  to help others.
published: false
---
## Introduction
{{ page.intro }}

### Service Activator
To explain a service activator, let's start with a simple Java method that receives a string as input and prints
it to the console:

{% highlight java %}
public static void printString(String message) {
  System.out.println("Got it: " + message);
}
{% endhighlight %}

In a real-world setting, you can imagine this method does something more valuable. What we would like to do is expose
our printString method as a service. A message String can be sent over the network by a client of our service, and we
want to be able to invoke our method with the sent message.

You could expose the method as a web service, and this is easy to do in Spring. A web service usually means clients make requests over HTTP. What we would like to do is make our method available to any messaging infrastructure, for example, JMS, Redis, etc. Also, I don't want to have to make changes to my method to accommodate the infrastructure being used, since this means I'll have to make copies of my method for different applications and replicate logic. The idea is that the method shouldn't have any knowledge of how it will be invoked.

This is exactly what the Service Activator pattern does. The Service Activator is one of many message patterns from EIP (Enterprise Integration Pattern). Spring Integration provides support for EIP, and we can use the ```@ServiceActivator``` annotation from Spring Integration to annotate 'around' our method, exposing the method as a service, but leaving our awesome business logic inviolate.

{% highlight java %}
@MessageEndpoint
public class MyService {

	@ServiceActivator(inputChannel="input")
	public static void printString(String message) {
		System.out.println("Got it: " + message);
	}

}
{% endhighlight %}

The inputChannel attribute references an ```MessageChannel``` Spring bean

{% highlight java %}
@Bean(name = "input")
public MessageChannel messageChannel() {
	return new DirectChannel();
}
{% endhighlight %}

In EIP, a message channel is an abstraction for a 'pipe' through which messages can be sent and received. Our basic configuration above looks like this

![basic config 1](/images/eip_service_activator.svg)

With this basic configuration, we can send a message into the channel and see that our service is invoked. All we do is call the ```.send()``` method of ```MessageChannel```

{% highlight java %}
messageChannel().send(
  MessageBuilder
    .withPayload("here's a new message!")
    .build());
{% endhighlight %}

Running this should give

{% highlight text %}
Got it: here's a new message!
{% endhighlight %}

![invoking the service activator](/images/eip_service_activator_2.svg)

This example shows the service activator being invoked by the same process using a very simple message channel, a ```DirectChannel```. A ```DirectChannel``` is point-to-point in the sense that there can only be one receiver on the end.

### Message Polling
In reality, we would be invoking the service from a different process (i.e. another Java program), and would be using some messaging infrastructure like a database or message broker. There may be other clients of the service so we want our messages to file into a line with others and let our printMessage method process each method in order of arrival.
