---
layout: post
title:  "Intro to Docker Networking"
date:   2016-10-22
categories: docker
tags: [ docker, devops ]
intro: >
  In this post, we'll use a basic REST application with a Mongodb backend to demonstrate how Docker networking works.
published: false
---

* TOC
{:toc}

{{page.intro}}

# The Basics of Docker networking

Out of the box, Docker comes with three networks

* bridge
* host
* none

You can see these by running ```docker network ls```. By default, when you launch a container with ```docker run```, it is added to the bridge network, so we'll discuss that next.

## Bridge

This one is easy to understand. Containers on a bridge network act like they are on an isolated switch with their own subnet. In fact you can see this subnet by running

```bash
docker network inspect bridge
[
    {
        "Name": "bridge",
        "Id": "e180547ba59c7bd7088ee6a456c80fbead7b51836417b8df8206852b2ef457c9",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.17.0.0/16",
                    "Gateway": "172.17.0.1"
                }
            ]
        },
        "Internal": false,
        "Containers": {},
        "Options": {
            "com.docker.network.bridge.default_bridge": "true",
            "com.docker.network.bridge.enable_icc": "true",
            "com.docker.network.bridge.enable_ip_masquerade": "true",
            "com.docker.network.bridge.host_binding_ipv4": "0.0.0.0",
            "com.docker.network.bridge.name": "docker0",
            "com.docker.network.driver.mtu": "1500"
        },
        "Labels": {}
    }
]
```

If we had launched containers c2, c3, c4 just using ```docker run```, they would show up in the "Containers" : {} object, and would have ip address 172.0.0.2, .3, .4, respectively. The containers would be able to reach each other over the network by ip address. Containers can also reach the actual physical network the host is on via the gateway at 172.17.0.1.

With the default bridge network, **there is no dns service included**, so although containers are connected and can refer to one another by ip address, we can't use hostnames. What would we expect from a dns service for Docker containers. Well for one, if we launch a container giving it a name

```
docker run --name mymongo -itd mongo
```

wouldn't it be great if the dns service resolved the container name (mymongo in this case) to the container's ip? That's exactly the way it works, but we need to create our own user-defined network to get this.

## User-Defined Networks

Let's create our own bridge network

```
docker network create my-app
62d66fd8eb6d6f8b6757b68c3960813c9199dbbdd4df147758185409a17ff868
```
and inspect it with

```
docker network inspect my-app
[
    {
        "Name": "my-app",
        "Id": "62d66fd8eb6d6f8b6757b68c3960813c9199dbbdd4df147758185409a17ff868",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1/16"
                }
            ]
        },
        "Internal": false,
        "Containers": {},
        "Options": {},
        "Labels": {}
    }
]
```

Note, this time we get our own subnet 172.18.0.0/16 and gateway. The one thing you need to know is that we can connect our containers to this network at launch time with

```
docker run --name webserver --network my-app <some-image>
```

and other containers will be able to reach this container by the hostname ***webserver***.

# Our Basic Application

## Saving Contacts

Our application will keep track of contacts, which will have a basic data model that looks like this in JSON

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Somewhere Rd, Anywhere TX 12345",
  "email": "jd123@example.com",
  "phone": "123-456-7890"
}
```

We will create a REST service that exposes contacts and allows us to retrieve, create, update, and delete them. These four operations sometimes go under the acronym CRUD (Create, Read, Update, Delete), and map to the HTTP verbs POST, GET, PUT, and DELETE respectively. If this didn't make much sense, don't worry. It will all come together when we have the service up and running.

To save our contacts, we need a database, and for that we'll use MongoDB. This will be our first container we'll launch on our network.

## The Contacts Database

MongoDB publishes a Docker image to [DockerHub](http://hub.docker.com), a public registry of images. DockerHub is free to use, and you can create your own account and publish containers you build under your own namespace. The image we're after is named ***mongo*** (names like mongo, mysql, nginx, etc are the officially supported versions). Let's pull this image and launch it at the same time by running

```
docker run -itd --name app-db --network my-app mongo bash
```

There are three options we passed to the run command

* -i (interactive) runs the container in interactive model
* -t allocates a terminal so we can connect to our container
* -d detaches from the container so we're not presented with a console

Let's connect by starting a bash shell

```
docker exec -it app-db /bin/bash
```

Then we can start the mongo client by running ```mongo``` at the prompt.

## The Contacts Service

To test connectivity, we need another container. This container will be a base linux image with java preinstalled. Let's retrieve the image

```
docker pull openjdk
```

and launch it on our network

```
docker run -itd --name app-rest --network my-app openjdk bash
```

Since we've specified the options -i (for interactive mode) and -t to allocate a terminal, we can attach to the container's terminal with (you may have to hit enter a few times to get a prompt to show)

```
docker attach app-rest
```

Now we can try to ping our database

```
root@d8ad88799916:/# ping -c 3 app-db
PING app-db (172.18.0.2): 56 data bytes
64 bytes from 172.18.0.2: icmp_seq=0 ttl=64 time=0.097 ms
64 bytes from 172.18.0.2: icmp_seq=1 ttl=64 time=0.134 ms
64 bytes from 172.18.0.2: icmp_seq=2 ttl=64 time=0.134 ms
```

Great, we have one container with java installed, and another running mongodb, with hostname resolution using the container name as hostname.

### Contacts REST API

Our REST service will be a standalone Java application, so it is best packaged as an executable jar archive. The Spring framework has a subproject, Spring Boot, with exactly this in mind, packaging apps in standalone executable jars that can be executed with

```
java -jar app.jar
```

So getting our REST service up and running in a container involves three steps

* getting a container with java installed...done
* copying our jar to the container
* starting the container and have it run the jar by executing ```java -jar app.jar``` on start up.
