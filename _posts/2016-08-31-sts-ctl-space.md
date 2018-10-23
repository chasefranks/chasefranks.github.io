---
layout: post
title:  "STS: Let Ctrl+Space Simplify Your Life"
date:   2016-08-31
tags: [ tips, eclipse, sts ]
intro: >
  Spring Tool Suite offers the ability to quickly inject frequently used snippets into your code. The pattern is basically: type the first few letters of what you're trying to do, hit ```Ctrl+Space```, and what you want magically appears. We discuss a few of the built in patterns STS offers, how to look up others, and how to create your own.
published: true
permalink: /workflows/sts/templates
---
{{page.intro}}

## An Example - Creating a private static ```Logger```

One of the things I'm always doing is creating a Logger rooted inside of the class I'm working in.

```java
public class MyBean {
	private static final Logger log = LoggerFactory.getLogger(MyBean.class);
}
```

With templates, you can avoid typing this all out everytime. Type 'log' and hit Ctrl + Space. You should get a list of choices like so

![log code template in sts](/images/log-code-template.png)

The choice that usually works for me on most projects is the 'static logger field using slf4j'. Highlight it if it isn't selected already, and hit enter. You should see your ```Logger``` field created and initialized like above.

## Another Example - Creating a Spring Boot main() method

Let's say you're writing a Spring Boot application, and want to quickly create your main method which calls ```SpringBootApplication.run()```. Where ever you want to create the main method, type 'main' and hit the magic Ctrl + Space key combo again

![main code template in sts](/images/main-code-template.png)

Hit enter and you should get

```java
@SpringBootApplication
public class MyApplication {
	public static void main(String[] args) throws Exception {
		SpringApplication.run(MyApplication.class, args);
	}
}
```

## How to look up other templates

The easiest way is to just hit Ctrl+Space on a blank line

![showing all code templates](/images/all-code-templates.png)

then start typing something resembling what you want to see if it semantically completes. For example, say I'm in a ```@RestController``` and want to rack out a POST handler. If I start typing post, I see something that might help me

![post code template](/images/post-code-template.png)

If I hit enter, I get

```java
@RestController
public class MyController {

	@RequestMapping(value = "path", method = RequestMethod.POST)
	public String post(Object formObject, BindingResult bindingResult) {
		// TODO Auto generated method stub
		return null;
	}

}
```

a generic method already annotated with ```@RequestMapping``` and method set to handle POST requests.
