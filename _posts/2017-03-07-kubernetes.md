---
layout: post
title:  "Some ramblings about Kubernetes and DevOps this week"
date:   2017-03-07
categories: ramblings kubernetes
intro: >
 I've been working a lot with Kubernetes, and thought I would present some random thoughts and some of the things I've discovered about it. Simply put, Kubernetes is a tool for orchestrating and deploying microservices packaged in containers. Instead of presenting technical content or demos, I just want to share my informal thoughts about Kubernetes, DevOps, and the context I'm working in.
published: true
---
{{page.intro}}

Let's start with the basics...containers.

### Containers

Ok, so you have an app, and now you want to deploy it. A container is a vehicle for packaging your application with everything it needs to run. Let's step back even further and see what this means.

An application will have one or more deployment **artifacts**, which are just files of some type. I'm a Java developer, so usually when I produce an app, it is a jar file, like ```my-app.jar```. JAR stands for Java archive, and it is nothing more than a zip archive with certain conventions for the directory layout, along with my compiled Java class files. This is my unit of work, and I want to be able to give it to people so they can run what I wrote and experience joy.

Sounds great. I upload my jar to my company's server and I'm done, right? Nope. You need the Java Runtime Environment (the JRE) installed on your machine to run the app. Now you can't just install any version of the JRE. You need Java 9, because I want to use the latest features before they're even released.

Ok, so you get an early release copy of Java 9 set up on your server, and start up my-app.jar. Now it's complaining about some missing ```.dll``` or ```.so``` file! I didn't tell you about those because I set that up on my development machine when I started the project, and forgot. What else did I forget? This can go on and on, and I'm just talking about running a single jar file. Also, trust me when I say this: Java is one of the more portable programming environments to work with.

The idea of a container is that instead of delivering a jar file, I would deliver a different kind of file called an **image**, that works like a small operating system (just like a small self-contained copy of Windows or Linux). This image would have Java 9, all of the .dll or .so libraries (whatever those are...I don't care!), and basically anything else the app needs to run. The images only job when it comes online is to start the application by running the copy of my-app.jar it contains.

Now, imagine all of the different programming languages, platforms, etc, and the different headaches they bring. Instead of each developer producing their own language specific artifact, everyone produces an image. These images are uploaded to the internet for everyone to download and run, and here is the most important thing to know about containers and images:

>  running the image is done the *same way*, *everytime*, for *everyone*.

This is what containers are, and the predominant technology for running, creating, and managing images is [Docker](http://docker.com). Developers package their application in a Docker image, and upload it to [DockerHub](http://hub.docker.com). The image can be downloaded and run by anyone with Docker installed on their machine and an internet connection.

### Kubernetes and Orchestration
