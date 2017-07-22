---
layout: post
title:  "Pipeline As Code"
date:   2017-07-04
categories: devops jenkins
intro: >
  Happy 4th of July! This weekend I finally got up and running with Jenkins [pipeline](https://jenkins.io/doc/book/pipeline/). In this post, I'll show how I managed to convert my existing freestyle job to a Jenkins pipeline job. I'll also discuss why I was interested in doing this to begin with, and my thoughts on the project so far.
published: true
---
Let's start out by discussing the concept of *pipeline as code* and why anyone would need such a thing. If you've created Jenkins build jobs before, tried to migrate jobs between Jenkins servers and lost configuration in the process, you've probably thought about this concept yourself. It falls into the rubric of a trend in DevOps, which is that everything concerning software, not just the source code, belongs in source control.

## What is Jenkins

Let's step back a bit and start by explaining what [Jenkins](http://jenkins.io) is. Jenkins is software that runs on a server that performs automation for software development teams. The server running Jenkins is typically called the build server, or the continuous integration (CI) server. Long story short: in Jenkins you create a **job** and tell it where your source code repository is. Every time the job is run, Jenkins will pull in the latest changes, compile your code, run tests, and build the deliverable artifacts you require. If you're interested, here is what the Jenkins UI (user interface) looks like

![jenkins ui](/images/jenkins-home.png)

The blue dots for each job means that the last build was successful. The weather icons show three sunny jobs with good stable histories. The two that I've been mucking around with have only recently been fixed, so Jenkins shows storm clouds for those. For a production instance of Jenkins there would be a lot of jobs constantly being executed by different teams while they work, and those jobs would constantly be transitioning states. While you can check the dashboard anytime you like, most teams are notified of build failures via email, chat, or some other message channel they are monitoring.

## Why Jenkins

Let's say you have some Java code stored in a git repository somewhere. As you work on your code, you will usually run a litany of unit tests before committing it to the repository. In fact, if you use Maven, unit tests are scanned for and run every time you use ```mvn clean package``` to compile and produce the .jar file. Before committing a change to the repository, most developers will run this command to make sure the project builds without errors.

When you are working by yourself, you can have a great deal of confidence that your local unit test sweep before commit means the code is fine. When you work on a team (even with just a few people), this is no longer the case. The main problem is that every developer maintains their own local *state* in their development environment. I frequently run into cases where a build works on one person's machine, but is broken on mine, and vice versa. No one can really agree on the state of the project because there is no common environment to check against. The practice of continuous integration relies on a central build environment where changes to source are constantly being integrated, compiled, and tested, as frequently as they are pushed by the developers.

This is where Jenkins comes in. Jenkins serves as the common build environment and is the last word on the state of the project. Usually, when the Jenkins build is broke, it is the team members' responsibility to get the build back into a working state.

For this reason, it is important to run the build frequently. If you only run the build every night at 12 a.m., and it is broke for some reason, it could be any change committed that day that could've broke it. To alleviate this, most teams configure Jenkins to run the build whenever new commits are pushed using something called a git ***web hook***. A web hook is simply a POST message with some payload that is sent to Jenkins from the Git server when new commits are pushed to the repo. When Jenkins receives the POST message, it pulls in the latest changes and runs the build. If developers are committing code frequently, Jenkins combined with web hooks makes it very easy to see which change broke the build, and makes it easier to fix the build as a result.

## Pipeline as Code

Now when you set up your job in the web UI, and you set up enough of these, you start to realize that there could be a lot of special configuration that is being performed for each job. You don't just stop at running the tests and building the .jar, .war, etc. A lot of Jenkins jobs will go on to building a Docker container, publishing to Nexus, or deploying the application, after the main build steps have been performed. There is a whole ecosystem of Jenkins plugins for doing all sorts of things, but sometimes when a plugin isn't available to do what you want, you have to install tools right onto the server. This makes the Jenkins server a ***snowflake***, which means that there is so much specialized configuration not documented anywhere, it becomes almost impossible to reproduce reliably in the event of failure or migration. [Here](https://tech.winton.com/blog/2017/04/continuous-deployment-of-containerised-microservic) is a good post on just this topic.

As you are pointing and clicking, you can't help but think

> What would happen if this server crashed right now and I lost all of the jobs and configuration I've set up? Also, it's lonely here...how did I get stuck with setting up Jenkins and how can I get the team involved?

The UI for Jenkins is not intuitive at all, and the documentation is even worse. If you work with it enough, you get the hang of it, but it requires time that not everyone has. This means that replicating or reproducing jobs you've set up in Jenkins requires specialized and expert knowledge in Jenkins itself. Again, let's go back to basics:

> I can simply run mvn clean package, docker build, docker push, etc from a terminal or automate it with a simple bash script.

This is the baseline complexity you are dealing with, so Jenkins should not add too much of it's own lingo to it or else the 'tail is wagging the dog' so to speak.

Another thing that happens all the time is that jobs are migrated from one Jenkins server to another. You can't just export the jobs and have it work on the other server, because it's not one-to-one: You need to know all of the plugins installed on your server, and may have also installed some tools onto the actual server that Jenkins is running on (i.e. Docker). When I'm asked to provide my job configuration, my default answer is to export the list of plugins installed, along with the job xml descriptor using the Jenkins cli, but I'm always a little sad when I do it because I know it won't work.

*Pipeline as Code* was introduced by Jenkins 2.0 as a way of describing a project's build in a simple declarative language. A Jenkins ***pipeline*** is simply a series of build stages: checkout, build, test, deploy, etc. The central idea is that you describe your pipeline in a simple text file that is checked into your code repository. The default is to name this file ***Jenkinsfile*** and place it at the top of your project directory. You simply have to tell Jenkins where your repository is and it will create and run your pipeline for you.

## An Example

To see how this works, let me demonstrate with a simple Spring Boot project I am working on. Here is the usual Maven project structure

```
mydiary/
├── Dockerfile
├── Jenkinsfile
├── README.md
├── k8s
├── pom.xml
├── src
└── target
```

and I've put my Jenkinsfile at the top so it can be easily found by Jenkins. Let's take a look at what this file contains.

{% gist f39320700cfba1f5e86b2cf80e738de9 %}

Now breaking this down a bit without going into too much detail:

* ```node { }``` allocates a Jenkins node for this pipeline.
* ```stage(label){ }``` there are four stages to this pipeline:
  * ```checkout``` - checks out the branch this Jenkinsfile was found on
  * ```build jar``` - builds the jar using Maven
  * ```build and push Docker image``` - builds and pushes a Docker image specified by the Dockerfile at the root of the project. The image is tagged *dev* and *dev-<shortCommitSha>* and then pushed to DockerHub using the default Docker credentials configured in this Jenkins instance.
  * ```deploy to dev``` - deploys to a local Kubernetes cluster I have running on my home network. Jenkins doesn't have
  the ```kubectl``` tool available as a Jenkins managed tool yet, so I'm just using the shell step ```sh``` to run shell commands.

Maybe you find this readable at first glance, maybe not. The important idea here is that the build info is in the right place...source control. Now we can spin up a pipeline job, and we now have a way of doing it that is repeatable and is easily ported to different Jenkins servers. The goal should be to avoid making any changes directly in the UI, or to at least minimize the changes to only the most high level and generic configuration needed. The build per project should be completely driven by the Jenkinsfile.

## Blue Ocean

Jenkins is heading in the right direction with their new UI called [Blue Ocean](https://jenkins.io/doc/book/blueocean/), which facilitates just this workflow and focuses exclusively on Pipelines.

Let's create the pipeline described in our Jenkinsfile in Blue Ocean. I find it a little hard to get the Blue Ocean UI, since they moved the button that was front and center off to the side. In any event, you can just append ```/blue``` to the url in your Jenkins server to get there. For example, if your Jenkins server is accessible at ```http://myjenkins:8080```, then go to ```http://myjenkins:8080/blue```.

Click ***New Pipeline*** in the upper right corner, and bring up the Create Pipeline screen:

![create pipeline in Jenkins Blue Ocean](/images/create-pipeline-1.png)

We're going to give it our Git repository. This code is not on Github at the moment. It is in a private Git server I'm running in my home lab with url ```ssh://git@gogs.home:10022/chase/mydiary.git```, so we choose the plain Git option and give it our repo url.

![create pipeline in Jenkins Blue Ocean](/images/create-pipeline-2.png)

Next we just click Create Pipeline, and we're off. The pipeline job is created and starts running. When it finishes, it shows the status as successful

![pipeline success](/images/create-pipeline-3.png)

We can click on this run to see a visual of the stages of our pipeline, and can click on any stage to see what was performed

![stages](/images/create-pipeline-4.png)

This project actually produces a Docker container. The mvn package produces the jar, and if you know a little about Spring Boot, you know that the jar is *runnable* which means it contains a stand-alone application that can be run with ```java -jar my-app.jar```. All it needs to run is a Java environment, so we wrap the jar in a Docker image with Java already installed. This is specified by the Dockerfile in the project root. This image is then published to DockerHub. Remember the Jenkinsfile tagged the image with dev and dev-shortCommitSha where the shortCommit was the first 8 hex digits of the commit sha, so this means we can always trace the image back to the commit from which it was built.

![docker-build detail](/images/create-pipeline-5.png)

If we check DockerHub, we see the image we just pushed is there

![check DockerHub](/images/dockerhub-mydiary.png)

We're now free to deploy it into any environment we like, for example a Kubernetes cluster or Docker Swarm. In fact, for a development environment, it would make sense to actually deploy as part of the pipeline as well. I've only just scratched the surface of what's possible here.

Please let me know what you're doing with Pipeline, or if you want me to look into something post in the comments. I still haven't picked up the multi-branch pipeline idea yet, and would love to see it in action. For example, how do you prevent merging the Jenkinsfiles between different branches, or is a single Jenkinsfile used with case logic depending on the current branch?

### Updates

There are two syntaxes for Jenkinsfile:

* declarative - not as flexible, but more structured and as a result may be easier to see the flow of the pipeline
* scripted - more flexible, can use most Groovy constructs, more powerful

I changed the example Jenkinsfile to use scripted syntax because, suprisingly, I couldn't figure out a way to get the short commit sha from the latest revision, or if I had it trapped in a variable, I couldn't pass it to a different stage down the pipeline.

Another issue I have found while reading through the literature about Jenkins, Docker, and Kubernetes, is that there seems to be some confusion regarding the two different scenarios:

1. I want to produce a Docker image or deploy to Kubernetes as part of my build.
2. I want to run Jenkins itself in Kubernetes with Jenkins slaves provisioned on demand.

The second scenario is obviously very interesting and from demos I've seen it can provide a highly performing build environment, where builds are actually executed in Docker containers. However, it seems to me that the most natural thing someone would want to do first is deploy *their* application to Kubernetes from Jenkins. If you look at the documentation for the pipeline steps available for Kubernetes: [Pipeline Steps](https://jenkins.io/doc/pipeline/steps/kubernetes-pipeline-steps/), and [DevOps steps](https://jenkins.io/doc/pipeline/steps/kubernetes-pipeline-devops-steps/), it's clear (if you can sift anything from docs that lack a single example) that they are geared towards running stages of the build in Docker containers on Kubernetes. But for the simple task of deploying *my* application to Kubernetes, I had to basically go back to using the shell. Unless I'm missing something, this is the tail wagging the dog in my opinion.
