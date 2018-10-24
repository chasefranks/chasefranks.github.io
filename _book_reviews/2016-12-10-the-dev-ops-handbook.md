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
disqus_id: devops-handbook
---
# Intro

{{page.intro}}

# Review

Overall, I'm finding this to be one of the most relevant books in my journey as a software developer. I have been doing software development since 2011. My last job as a Java developer working on PKI/cybersecurity applications adopted a waterfall methodology, but I switched companies and am now working in an agile environment. I've observed a lot of the shortcomings of traditional software development firsthand. My belief is that a lot of this comes fundamentally from mistrust and a 'silo' mentality, where groups work in total isolation and neither desire, or receive, input and feedback from others. Developers, who are by nature intellectually curious and thrive on experiment, more than likely suffer greatly under these limitations. This is the reality and the authors do a great job of outlining the issues.

While this is a great book and describes what is to me, my ideal workplace, my experience has been that if management is not on board, the culture will be fearful and slow to change. The majority of software shops more than likely fall short and regress to blame, bureaucracy, and silo building, from habit and reflex. My practice, unfortunately, has been to 'vote with my feet', and try to find something better. I came to this book for guidance on how to affect change in my organization.

**N.B.**, this is very much a review in progress. I will probably get a lot wrong, and will update this review as I learn more about this topic and apply it to my job.

So let's dive in to the book.

## Flow

This section starts with a little history and background on agile, and shows how agile has progressed into the DevOps movement motivated by nothing less than the revolution in manufacturing processes that occurred in the 80s. It discusses the Lean manufacturing process, the Toyota Manufacturing System, and from this context identifies the fundamental concept of a *value stream*.

Let me step back and illustrate these concepts with what I do every day, write software for web applications.

My value stream starts with an idea, and ends with an end user of a web application seeing the idea implemented and using it to make their job easier.

The idea is codified in something called a *user story*, which is a short description of the new feature along with some acceptance criteria describing a few requirements. The user story should not get into technical details, and should describe the feature from the user's perspective. Here's an example

> As a user of the HR application, I want to be able to see all open staffing requests at a glance and sort by the date opened.

The idea of the user story is that is should be deliverable increment of work, that can get into the customer's hands (i.e. in production) as quickly as possible, ideally at the end of a two week sprint. The customer can provide quick feedback that informs additional user stories.

Most agile teams use a Kanban board to track progress on user stories and the sprint. You may have seen something like this if you've ever walked into an IT office

![kanban board...yes those are sticky notes](/images/kanban_board.jpg)

Yes...those are sticky notes. Each sticky note represents a user story, i.e. a single piece of functionality. The user stories progress from left to right as they go through the stages of development. That's all that's going on here.

Sometimes, the Kanban board is represented digitally. My team uses something called Rally to track progress on user stories, and it has a built in Kanban board that allows you to drag and drop the user stories into the appropriate column. Whatever the representation, the important part of a Kanban board is that it is *visible* and is a faithful representation of the work the team is doing.

## Feedback

Part I discussed the idea of *flow*, which from the perspective of most developers, is the forward movement of user stories from development into production. One of the hallmark themes of DevOps is to integrate the production environment into development from the very beginning, through techniques such as Continous Deployment.

The second part of this book deals with Feedback. After we've enabled fast and continuous flow of value into production, we need metrics and telemetry at every level of our application and deployment pipeline:

![flow and feedback](/images/flow_and_feedback.png)

I think this quote from the book sets the stage for this topic (made at Etsy, a recurring case study for many examples in this book)

> "If engineering at Etsy has a religion, it's the church of graphs."

The concrete implementations of feedback include:

* telemetry (i.e. can I insert a single line of code to track successful logins...and have a graph displayed on a webpage!)
* user research (what are users doing on the site, when is it heavily used)
* logging

### An Aside on Logging

Believe it or not, this last one, logging, is not to be taken for granted. Some developers can have the mentality that debugging can be done through thought experiments, and take pride in their ability to troubleshoot *mentally* without logging. While impressive, it's usually a red flag to me that there is a single person who is responsible for sort of being the hero for the team. This approach just doesn't scale. People, albeit very smart ones, get tired. Eyes get blurry. People get fed up and quit, taking their knowledge with them. If this is all you're relying on, it's a mistake.

I've also seen logging being done poorly, where the log statements are not informative. The best you can say is that they correlate in time with the error, and troubleshooting means recognizing the "signature" of various errors in the log file. These signatures go into a tribal history, which again signals that there is stickiness on one person to troubleshoot all issues, or at least a reliance on "time served" instead of technical competency to solve issues.

### Back to the Review...
Developers should be enabled to easily implement telemetry in their code. Some of the tools this book mentions are:

* JMX
* statsD (another tool developed by Etsy, with developer ease of use front and center)
* collectd
* Graphite

I can't say I know much about these tools, but I'm enticed by this book to take a look and play around with them. Maybe I'll do a blog post on one of them.

One tool I *would* like to add to the discussion is the Spring Boot [Actuator](http://docs.spring.io/spring-boot/docs/1.4.2.RELEASE/reference/htmlsingle/#production-ready) project, which exposes metrics from within Spring Boot applications via a standard REST API.

### Publishing or Radiating Metrics
The next step after collecting metrics, logging, and implementing telemetry, is publishing (the book calls it *radiating*) the metrics in public places for everyone to see. I really like how the book makes this point, through an example with LinkedIn. Real production metrics are prominently displayed in their engineering offices, in plain site of customers, visitors, etc. You can only imagine what this says about the culture.

Radiating this information not only means making the data for feedback easily available for developers, but displaying the data in a meaningful way. One example the book gives is displaying a vertical line over the time each production deployment is made for any time-based graph.

To see how important this is, imagine if no metrics, logging, etc are ever collected. When things go wrong, how do you think people will behave without knowledge and a scientific approach to problem solving. You guessed it! It's not very nice, and anyone who has worked in IT (and probably many other professions) for any length of time has to manage this tendency of people. However, because of the nature of software, you can end up with a lot of people who are on the hook, who don't know the first thing about *what* actually happened.

## Continual Learning and Experimentation

After you have a smooth flow and feedback, what is the next step to becoming a great technology organization? This section of the book talks about the practice of continual learning and experimentation, and making it institutional.

The examples below are summarized from the book.

### The Netflix Chaos Monkey

Netflix is a recurring example throughout this book. Their entire infrastructure resides in Amazon Web Services (AWS), and is built for resiliency. In 2012, an entire AWS datacenter went down, and of course the services residing in that datacenter went down with it. Netflix had trained just for this event, and had designed their systems with failure in mind from the start.

They had 0 downtime as a result of the outage. When the outage was happening, there wasn't even anyone in the office working escalations. They were at a party in Hollywood to celebrate a recent achievement.

How did they get to this level of resiliency? It turns out (you're going to love this...) that they have a program called Chaos Monkey, that randomly takes down services in production to test response to failure. Part of this testing was to take down server nodes running Cassandra (Netflix's database of choice), and this turned out to be the service most effected by the outage.

### 20%

Google is famous for allowing it's employees to devote 20% of their work time to endeavors outside of their main project. This equates to a day out of the work week that can be used to explore and contribute to something worthwhile. What would you do with that time?

### Paying Down Debt

When working on technical projects, it is a necessity that shortcuts have to be taken to meet deadlines or make forward progress. Unfortunately, these shortcuts usually result in bad code and poor design decisions. Over time, these decisions can accumulate and can bog a project down, making changes difficult and error-prone. This accumulation is called *technical debt*, and eventually creates so much entropy that it requires a complete rewrite of the software if not managed properly.

This is a very real issue in software development. On several occasions, I have suggested and offered to do something the "right way", only to watch the story show up in the off-shore team's work queue. Here are a few real life examples:

* hey, instead of adding a new field to a Java class for every new year, why don't we just add a timestamp field?
* instead of persisting objects to files on disk, why don't we use a database like MySQL with a persistence framework like Hibernate?
* so and so class, REST service, etc. needs to be refactored

This is, and always will be, very surprising to me. That doing something the right way is actually not desired nor encouraged, but this is one of the many sources of technical debt in action. It goes against my core nature to not do the best job I can. This part of me got me to where I am today, and will go with me through life no matter what job I happen to be at. I may have to yield to faulty management, but I will always be intellectually honest with myself and others. I will always be a software craftsman, striving to write the best applications I can using the best tools for the job.

This book discusses regularly devoting time to pay down this debt, by performing improvement *blitzes* or *hackathons*. This is a period of time where daily workarounds and 'one-offs' can be solved, and work on new features is postponed till after the blitz. You have to involve everyone in this work, not just developers, since a lot of debt piles up due to the availability of certain people.

### Blameless PostMortems

What should you do as a DevOps team when failures occur? This section gives great advice on conducting what are called *post-mortems*. These are meetings where reasons for the failure are discussed objectively without assessing blame to individuals. In fact, some of the examples this book gives (at Netflix no less) show that people who cause failures can be skilled engineers, and can cause major advancements in resiliency to happen as a result.

This comes back to a fundamental rethinking of what *failure* means. Failure is something that shouldn't be feared, but should be expected as a natural step in the progress towards success. The secret is not avoiding failure, but quickly recovering and trying again. If something seems impossible at the moment, take good notes, table it for the moment, and lightheartedly move on from it. Remember, software is a human endeavor...it's job is to serve **you** and not vice versa.

With technology, people are going to break stuff. It will happen, and if you haven't accidentally broken anything yet, give it time. If your team is really advanced, it will show when you break something. Higher level teams will welcome the opportunity to exercise their troubleshooting skills, show the robustness of their software, and use it as an opportunity to teach. You will be encouraged to become an expert on the 'root cause'.

What do we do with our root cause findings? A key theme of this book is taking knowledge out of siloes and making it global knowledge. The post mortem findings should be published, at least internally. Even if it's just the meeting notes. Etsy has an application called Morgue for managing post-mortem meetings, and Google is well known for making its post mortem findings public. Here's an [example](https://groups.google.com/forum/#!topic/google-appengine/p2QKJ0OSLc8).

## Conclusion

Well, this review is probably long enough, so I'll just end it here leaving you to read the book for yourself. This is probably one of the most valuable books I've read. I consider myself a DevOps practitioner, and I think this book makes the best DevOps practices employed at Google, Etsy, Netflix, etc available to us all. I'm in total agreement that DevOps is a natural evolution of agile, and represents the optimal workplace for developers and IT workers who thrive on new ideas, experiment, and lifelong learning.

The only critique I have is one I'm not sure the authors could do anything about, since it's more a question of personal leadership. This book doesn't really address how to *start* a DevOps movement or operate in a culture where there is resistance to DevOps. The reality (in my world at least) is that if there is no support from management, you have two choices: keep your head down and mouth shut, or move to a company that will recognize your talent. This subject, albeit motivated by technology and deploying software, is more about people in my opinion.
