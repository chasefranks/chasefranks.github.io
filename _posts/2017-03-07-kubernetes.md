---
layout: post
title:  "Some ramblings about Kubernetes and DevOps this week"
date:   2017-03-07
tags: [ rants, devops, kubernetes ]
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

Docker makes running a single application a relative no-brainer. You go to DockerHub, shop for your image, download it to your machine, and run it. Since running the image is the same command everytime, the only thing you need to know is the name of the image on DockerHub.

This is huge...imagine that instead of a single my-app.jar, my application consists of 10 jar files that are run at the same time. In principle, if each jar is packaged in a Docker image, along with the right version of Java and anything else it needs, and each image is available on DockerHub under a unique name, then all I need to launch this beast are the 10 image names. I can put the names in a list, and maybe write a shell script that pulls down each image from DockerHub and starts it up. Docker has a tool called [Compose](https://docs.docker.com/compose/) that performs exactly this function. If you want details, you would put the image names in a file named ```docker-compose.yml```, and launch your app with command ```docker-compose up```.

#### An Aside: Microservices

Why would I break my application up into 10 separate artifacts? What was wrong with the one my-app.jar file? Wasn't it simpler to launch? Well it turns out from the developer and software architects (warped) point-of-view, that one my-app.jar was doing a lot of stuff. It had a lot of code and twisted logic, and in fact, had so many internal responsibilities that catching bugs was difficult if not impossible. It was easy to isolate 10 independent services the app performed, each with their own data model and logic. Most importantly, each service could be tested in isolation of the other components, to make sure that it performed the responsibilities in its scope.
If it was so easy to logically separate, why did it become so uber and god-like in the first place? Remember, deployment used to be a headache? There was no time to think about separating out responsibilities into different apps because we were too busy worrying about the next release and what new issues would crop up when it was launched. The one my-app.jar was there, so that's where all the logic went. That's what customers were used to dealing with.
Now that the 10 services are packaged as Docker containers, uploaded to DockerHub, and can be launched simultaneously on any machine with one command, the inertia that was preventing us from breaking up the monolithic my-app.jar into more logical units isn't there. It doesn't seem so crazy to break out even smaller **microservices** since it's all the same from Docker's point of view...just push the new service image up to DockerHub and add its name to the docker-compose file.

Ok, now what is Kubernetes and how does it fit into the picture? Well, there's been a tacit assumption underlying everything I've described to you so far with Docker and the docker-compose command...we're running everything on one physical machine. When you install Docker, it creates a network interface on your machine which functions as a virtual 'switch'. Running containers are plugged into this switch and can communicate with each other over this interface without any packets ever actually hitting a physical wire. This is great for development. In production however, there's one major problem with this assumption: machines die.

Maybe that's a little dramatic, so only the hard drive dies. You know, when it starts making a clicking noise? The point is, things like this are all it takes to bring down a single machine albeit temporarily. During that time, all 10 services are down and out.

The answer to this problem is to sprinkle the services over a number of physical machines, and this is the basic function of [Kubernetes](http://kubernetes.io). Kubernetes sits one level higher than Docker, and instead of you directly running your Docker images with tools like the docker cli or docker-compose, Kubernetes does it for you by scheduling it to run on one of a number of physical servers, each capable of running Docker images.

### The DevOps Context

Wow, so what's all of this stuff like to work with?

#### Learning Curve
First off, it's complex stuff. Kubernetes is a technology created by Google for running it's own apps on the Google Compute Platform, so its natural home is in the cloud. If you're like me, you want to tinker with stuff by setting up your own lab. Luckily, they provide a tool called [minikube](https://github.com/kubernetes/minikube) for setting up a local single-node Kubernetes cluster. Go with it and install it. It's easy and a lot of the examples use it. I initially had some problems getting kubectl to **not** go out to my corporate web proxy to connect to the Kubernetes api server, but perservered and have been using it daily to iterate on a large Kubernetes deployment. I have also had some luck running a four node cluster with flannel overlay on Ubuntu server VMs. [Here](https://github.com/chasefranks/ansible-kube-ubuntu) are some Ansible playbooks I wrote to automate this process. After about a week or two of working with the Kubernetes resources (Pods, Deployments, Services, etc) and kubectl command line interface, I feel like I'm starting to get the hang of it.

#### Documentation
I have found the Kubernetes [documentation](https://kubernetes.io/docs/) to be extremely inviting, well-written, and complete, if a little difficult to navigate. It's a little annoying that beta extensions to the API aren't easy to navigate to, like the ```Deployment``` definition which is used over and over again. The search functionality makes up for this, and what you find is usually relevant and get's you going with examples.

#### Cluster Availability
You'll get bored with minikube, and will want to actually deploy to a real cluster at some point. Again keep in mind, Kubernetes is a cloud focused technology. Unless you're lucky enough to work in an AWS or Google Compute Platform environment, spinning up a new Kubernetes cluster won't be a simple one liner. I used ```kubeadm``` to set up the Ubuntu cluster I mentioned earlier, but I'm under the impression that kubeadm is a fairly newish, currently in alpha, maybe close to beta, stage tool. If you can get several VMs provisioned in your environment, setting up Kubernetes in your work environment is within reach.

#### Private Registry Woes
Finally, remember that DockerHub site I told you about? It turns out that in the corporate world, it's a big bucket of nopes to release internally produced software to the public internet. It doesn't matter if it's a 10 line NodeJS program that anyone with a modicum of knowledge could write, the paranoia is still there. Will people explicitly tell you it's off-limits? My observation is that no one really tells you anything, more than likely because no one really wants to do the work to understand the technology and quantify the risk. They just cobble together phrases like *shadow IT* to discredit and delegitimize...some people I guess...who really knows what that phrase means anyway?

Ok, so there must be a way to set up a private version of DockerHub. There is, but this requires going to so-called support engineers to get them to help you set up something called a Docker registry. This is the crux of the Docker/Kubernetes ecosystem: that there is a secure, publicly available registry of images. It's totally ok that the registry is reachable only from within the corporate network. You just preface your image name with the registry hostname, like ```my.corp.dockerhub/myapp```. The reality for me at least, is that my team (of mostly developers, ok...really me and another guy) is taking on the work of providing some type of private repository, and it doesn't really feel like the cavalry is on the way. If you're at the forefront of an effort to use Kubernetes or even Docker at your organization, keep these issues in mind. Remember, you are doing the work that could be and is usually the job of an entire dedicated team.
