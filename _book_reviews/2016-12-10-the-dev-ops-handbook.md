---
layout: book-review
title:  The DevOps Handbook
author: Gene Kim, Jez Humble, Patrick Debois, John Willis
date:   2016-12-10
categories: book review devops
intro: >
  In software development, there are traditionally two major 'camps': developers,
  who write new software and want to get it released to the customer as quickly as possible,
  and operations who must safely deploy the new software without breaking anything and causing
  an outage. This book and the DevOps movement in general is an attempt to break down the wall
  between these two groups and help them merge their processes so that new software is delivered safely
  and successfully. While this may sound like a simple management problem, in practice it's a complex
  issue that in addition to adopting new technology, involves company culture, building trust, and
  changing the way software is delivered.
image-url: https://images-na.ssl-images-amazon.com/images/I/51GspNFDWIL.jpg
published: true
permalink: /books/reviews/devops-handbook
---
# Intro

{{page.intro}}

# Review

Overall, I'm finding this to be one of the most relevant books in my journey as a software developer. I have been doing software development since 2011. My last job as a Java developer working on PKI/cybersecurity applications adopted a waterfall methodology, but I switched companies and am now working in an agile environment. I've observed a lot of the shortcomings of traditional software development firsthand. My belief is that a lot of this comes fundamentally from mistrust and a 'silo' mentality, where groups work in total isolation and neither desire, or receive, input and feedback from others. Developers, who are by nature intellectually curious and thrive on experiment, more than likely suffer greatly under these limitations. This is the reality and the authors do a great job of outlining the issues.

While this is a great book and describes what is to me, my ideal workplace, my experience has been that if management is not on board, the culture will be fearful and slow to change. The majority of software shops more than likely fall short and regress to blame, bureaucracy, and silo building, from habit and reflex. My practice, unfortunately, has been to 'vote with my feet', and try to find something better. I came to this book for guidance on how to affect change in my organization.

**N.B.**, this is very much a review in progress. I will probably get a lot wrong, and will update this review as I learn more about this topic and apply it to my job.

So let's dive in to the book.

## The Three Ways

This section starts with a little history and background on agile, and shows how agile has progressed into the DevOps movement motivated by nothing less than the revolution in manufacturing processes that occurred in the 80s. It discusses the Lean manufacturing process, the Toyota Manufacturing System, and from this context identifies the fundamental concept of a *value stream*.

Let me step back and illustrate these concepts with what I do every day, write software for web applications.

My value stream starts with an idea, and ends with an end user of a web application seeing the idea implemented and using it to make their job easier.

The idea is codified in something called a *user story*, which is a short description of the new feature along with some acceptance criteria describing a few requirements. The user story should not get into technical details, and should describe the feature from the user's perspective. Here's an example

> As a user of the HR application, I want to be able to see all open staffing requests at a glance and sort by the date opened.

The idea of the user story is that is should be deliverable increment of work, that can get into the customer's hands (i.e. in production) as quickly as possible, ideally at the end of a two week sprint. The customer can provide quick feedback that informs additional user stories.

Most agile teams use a Kanban board to track progress on user stories and the sprint.

The user stories progress from left to right as they go through the stages of development.
