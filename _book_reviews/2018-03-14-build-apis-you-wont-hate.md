---
layout: book-review
title:  Review of Build APIS You Won't Hate
author: Phil Sturgeon
date:   2018-03-14
categories: review
intro: >
  My latest gig is in an environment that produces a lot of REST APIs with Swagger documentation for every one. I got this book to dive into the topic of best practices for REST, and how to make APIs that are as usable as possible. I found this book to be a great read, filled with practical advice from someone who has done a lot of work in this area and has found through trial and error, what makes an API not only more easy to consume, but more adaptable to change.
image-url: https://images-na.ssl-images-amazon.com/images/I/41A-D5UDB%2BL._SX382_BO1,204,203,200_.jpg
published: true
permalink: /books/reviews/build-apis-you-wont-hate
disqus_id: build-apis-you-wont-hate
---
{{page.intro}}

## The Good

First, let's talk about the writing style, because I found this to be one of the books major selling points. I loved the conversational and often colorful language Phil uses throughout the book. It's like you've joined a company and Phil is your mentor, sitting there talking with you and prepping you with advice to help you become an API rockstar. If you've worked around enough competent developers, you know that they are usually extremely opinionated. The topic of REST APIs and what works and what doesn't, is exactly the kind of thing where opinions and lively debate pay off. I know for my own work, I could use more guidance on what exactly the larger picture of REST is, and this book steps up to the plate in this regard. Also, there are references throughout the text to other resources, blog posts, and articles discussing RESTful design principles and bringing the reader up to speed on some important debates that have been had in this area.

This book can be used as a practical guide to REST and covers all of the RESTful principles, including what I think is the one of the best chapters of the book and the central idea of REST, HATEOAS. This chapter and the following chapter on API versioning are the highlights of the book. He goes right to the core of what REST is, and turns it into practical advice. The theory is introduced from the point of view of someone who practices it, and adopts what actually works in the marketplace. HATEOAS is more than just an abstract idea, it is something that can make your API more easily consumed and therefore more valuable.

Besides being a great practical introduction to REST, this book touches on lots of other aspects of developing APIs for consumption by others, the two most important being documentation and testing. I use Swagger for documentation and Cucumber for BDD testing, and both of those and are discussed in this book along with other tools.

## The Bad...or My Opinions Really

I don't really have any criticism for this book, just my own points of view. Chapter 8 starts with command-line debugging techniques, and `curl` is mentioned. I agree that one of `curl`s benefits is using it when say you're logged into a bastion host and need to debug from a headless server environment, where the command line is all you have. However, I think there's more benefits to `curl` than that, even though Phil is right on with the fact that the syntax is ungainly and hard to remember. I don't use curl to dev test my APIs while I'm developing because it would be much too slow, and I don't have time to decipher the man page. I use Postman, and lately have been using Cucumber for acceptance testing.

However, I do think curl has it's use cases. I've found `curl` to be a great way to expose everything going on in a single REST API call, and because of this, it's a good litmus test as to the usability of the API. For example, one environment I worked in required APIs calls to be authenticated with a signed cookie. To get the cookie, you had to make your API request, let the API redirect you to a sign in page, authenticate using HTTP Basic Authentication, follow several subsequent redirects, store the authentication cookie along with several other cookies (this was an ancient in-house auth solution) in a curl cookie jar, then let the sign in redirect you to your original API request, this time with the cookie. I cooked up a pretty gnarly `curl` command to make API calls in this environment, and very often something would go wrong and it wouldn't work. Albeit this has nothing to do with REST proper, I've found that if you can't `curl` an API using every trick up your sleeve, this usually has implications as to the usability of the API.

Also, in a Linux environment, `curl` will be on everyone's system so it's a lowest common denominator. I may not be able to see everything that has been configured in Postman, but it's real easy for me to ask someone to `env` and `curl -v`, and Slack me the output. Anyway, I'm saying too much about this.

The chapter on database seeding seems out of place. I think he could've left this out of the book since it's not really about APIs per se. It's more of a chore that has to be done.

Lastly, let's talk about the code examples. Again, there's really no criticism here. Phil uses PHP as the language to give examples in, and even though I don't work with PHP at all, I found the code examples readable and easy to follow. If you're not a PHP developer, don't let this scare you off. My advice would be to skim read right over the code examples and any discussion of PHP on a first read. Then later, go check out the code and try to deploy it, maybe looking into the PHP tools he his using. I plan on doing this and then giving it a second, more in depth read. I'll post my experience here afterwards by updating this review. That being said, I think the book easily stands on its own without the PHP examples.

## Summary

This is one of those books I would recommend to a colleague and then check with them later, eager to hear their thoughts. I would also read this book right before a meeting to convince someone about why verbs don't belong in urls. I think the best way to make this book come alive is to try and implement these ideas in your own API.
