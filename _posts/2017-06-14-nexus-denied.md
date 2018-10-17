---
layout: post
title:  "Nexus Denied"
date:   2017-06-14
categories: devops silos
tags: rants
intro: Read more to find out how my organization denied my right to publish jars today...
published: true
---

So I would like to relate something that happened today, that is a sort of illustrates what I was referring to in my previous [post](/ramblings/2017/06/12/the-twilight-zone.html) about fiefdom building, and how IT organizations basically deny developers the tools they need simply because they can. If you can't tell from this blog, I am a Java developer. I work on a small, highly fragmented team, in a low-to-no trust environment. Because of my technical expertise, not only in Java, but other areas like continuous integration and deployment, I am able to take software from source code to a production deployment, and frequently contribute my expertise to help teams set up their release cycles and build pipelines. Well, today I needed something I thought was a no brainer...push credentials into a Nexus repository so I could make a jar available to maven builds executed on the corporate intranet. I started by sending an email to my manager asking for the credentials for our group (they are usually username/password that you can encrypt and add to your maven settings). After being ignored for a day, I went to someone I had in my head as our DevOps liason. Of course, this person's role was never made clear to me, no introductions were ever made, and the only previous correspondence was broken email sparring over some trivial issues with Nexus/Jenkins that never got resolved. I emailed this person, with my manager CC'd on the chain. We went back and forth several times, and after several exchanges, I have basically been denied credentials to our official Nexus repository for publishing jars within the corporate intranet.

I want to take a step back and explain what I'm talking about here, along with some helpful and colorful commentary.

# Maven

[Maven](https://maven.apache.org/) is a tool for compiling Java code and managing Java projects. A developer works by editing what are essentially text files saved with a name like MyClass.java. Each text file is compiled to a Java **class** file, which is the binary representation of MyClass that the Java Virtual Machine is able to load and run.

```
MyClass.java ---> MyClass.class
```

This process is referred to as **compiling**. It can be done by hand with the ```javac``` command that you get when you install the Java Development Kit (JDK).

In practice, you are working on anywhere from 50 to 200 .java files for a project, maybe more. After compiling, the resulting 50 to 200 .class files are assembled into something called a **Java Archive**, or a Jar file for short. The Jar is nothing more than a zip compressed archive of your java classes, possibly containing some metadata as well. You can unzip the jar and see the .class files anytime you like. Producing the .jar file is called **building**, and the resulting jar file is called the **build** or the **artifact**. The jar file is a fundamental deliverable unit for a team of software developers. It is our version of the widget if you like.

Maven is a tool that you install that will handle building the jar for you. With a simple command (```mvn package```) run from your project directory, all of the .java text files will be compiled into binary .class files, and those class files will be assembled into a .jar file. This is how professional developers build Java projects, and very rarely is the command ```javac``` used directly. There is a tool called [Gradle](https://gradle.org/), which performs the same function Maven does, that is just as good if not better.

Building Java projects into a jar is one half of what Maven does. In this way, it's very much like ```make``` used for C/C++. The other half of what Maven does is oh, so much more sweet. To really taste Maven, we need to talk about software dependencies.

## compile-time dependencies

Your project will use Java classes that other people have wrote, and are available in jar files downloadable from the internet. These classes and the containing jars are collectively referred to as **dependencies**. They are the upstream java projects that your project depends on.

Now as you are writing your code, you refer to any class you like: yours, someone elses, imaginary, etc. When you go to compile your code, the ```javac``` uses the **classpath** to actually look up the classes your are referencing in your code. The classpath is basically a list of directories on your machine, and you pass it to the compiler using the ```-cp``` option:

```
javac -cp /home/chase/classes:/home/chase/jars/*.jar MyClass.java
```

If the compiler can't find the class you are referring to on the classpath, you get a compile-time error. The classes you are referencing directly in your Java code are called **compile-time** or **build-time dependencies**, and the classpath in this context is sometimes referred to as the **build path**.

What Maven does is allow you to simply refer to a jar file on the internet using an identifier consisting of three components:

* groupId...Who is publishing this jar? Walmart, Spotify, etc. Could even be sub organizations, like Walmart accounting.
* artifactId...An id to specify this jar among all the jars this group produces and maintains.
* version...For this artifact, what version is it? 1.0.0, 1.0.5, 2.0.0, etc.

These are referred to as the **GAV** coordinates of the jar or dependency, and all you have to do is add the GAV tuple for a jar to a simple text file in your project called the POM (named pom.xml). Since the POM file has an xml format, a dependency listing looks something like

```xml
<dependency>
	<groupId>io.reactivex</groupId>
	<artifactId>rxjava</artifactId>
	<version>1.2.7</version>
</dependency>
```

The GAV coordinates are sometimes referenced using a shorthand notation

```
groupId:artifactId:version
```

For example,

```
io.reactivex:rxjava:1.2.7
```

This is how Gradle references dependencies.

Let's break this specific dependency down a bit in human terms. There is a group ```io.reactivex``` (this is actually their [website](http://reactivex.io) domain name reversed, a common convention to ensure uniqueness). They provide a number of artifacts related to their mission of providing reactive extensions for different programming languages, to facilitate the reactive programming model. Reactive programming is a newly emerging and very interesting programming paradigm which structures code as reactions to event streams. They have a number of artifacts (38 at time of writing) that they publish online, and ```rxjava``` contains the core components used in Reactive Java. This version is major version 1, minor version 2, and patch 7.

By simply referring to the jars you need in your pom.xml, Maven will go out to the internet and download the jar for each GAV coordinate you specify. When you build by invoking ```mvn package```, those jars are implicitly added to the build path.

To appreciate this, consider what you would have to do without Maven. You would have to find and download each jar from the internet, place it into a directory, and list this directory in your class path. For a few dependencies, this is not a problem. But if you have even 10 jars with their concomitant versions that need to be downloaded and updated when versions change, after a while you will get cranky and begin to have dry skin. Keep in mind, this has to be done on every machine that the build is run on, every developer and build server would need to replicate this process, and it would be done differently every time. It's tedious and error prone, and not to mention, without the central POM file maven uses, dependencies wouldn't even be listed *anywhere*. They would be discovered by running the build 50 times, each time using the resulting error to find the next missing class file, then you would need to find the jar that contains that class. This involves searching the internet, and even then, there is no guarantee that you are using the right *version* of the class. Maven basically forces Java developers to do the obvious thing, and that is to write down the dependencies for their project in a list. Believe it or not, there are many Java projects on the internet that don't use Maven or otherwise make it difficult to find out what their GAV coordinates are for adding to the pom.xml. If you maintain a Java project that is widely used, something like the xml snippet above or the Gradle shorthand should be front and center on your web site, and most of the time this is the case.

## run-time dependencies

So I have my project, and the dependencies I'm explicitly trying to use in my code. Ok cool, now I want to actually run my Java project. If you know some Java, this means that there is a class, maybe called MyApp.class, with a  ```main``` entry point method that looks like this

```java
public static void main(String[] args) {
  // code to bootstrap the app
}
```

and running the app means invoking the Java Virtual Machine (JVM) with the command

```
java -cp classpath MyApp
```

It doesn't matter what Java app someone is talking about or trying to run. If it's written in Java, at the end of the day, hidden in all the bash scripts and environment variables, this is how it is launched.

Now, your code will invoke code from the external jars you are depending on. What about the jars your dependencies depend on? Well, those classes will need to get loaded when they are needed as well, but it doesn't happen till *run-time*. In other words, dependencies of dependencies won't get loaded and invoked till they are actually needed during execution of the program.

These run-time dependencies will need to be available on the classpath at run-time, i.e. during program execution. If you actually want to *run* your code, for each one of your direct compile-time dependencies, you have to figure out and fetch *its* dependencies. This is called the **dependency resolution problem** or **classpath hell**, and it has now gone exponential on you: dependencies of dependencies, children of children, etc.

Maven again has done the work for you. Since [version 2.0](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html), the classpath maven uses for your builds is automatically populated with the full dependency tree derived from your POM. It starts with the direct dependencies listed in your POM, and adds those jars to your classpath. Then for each one of your direct dependencies, it goes to their POM and gets their dependencies and adds them to the classpath. This basically continues recursively with some conflict management taking place along the way. This means Maven can also run your code when it needs to as well, which facilitates unit testing, building a runnable jar, etc.

# Maven Repositories

Now all you need to do is list the dependencies you need by adding their GAV coordinates to the POM file. If you think a bit, this is a little too generic. GAV coordinates are used for locating jars, but there's nothing in the group, artifact or version, that says where to go on the internet to get that jar (the reversed domain name is just a convention...not a requirement, and is not where the jar would be anyway). This is because maven searches for the jar from among a list of repositories. A **repository** is basically a web site that makes jars available at conventional urls. For example, the rxjava dependency above is available at

```
http://repo1.maven.org/maven2/io/reactivex/rxjava/1.2.7/rxjava-1.2.7.jar
```

The repository in this case is the Central Repository at [http://repo1.maven.org/maven2](http://repo1.maven.org/maven2). This repository comes built-in to Maven and is the one stop shop for all open source Java projects. You can add other repositories by configuring your installation of Maven. For each dependency, Maven will consult the list of repositories it knows about until it finds a hit on the GAV coordinates you are specifying. From the example above, you can see the mapping from GAV to url is

```
group:artifact:version ---> /group/artifact/version/artifact-version.jar
```

so if you have configured repositores repoA.corporate.com, repoB.acme.com, repoC.example.com it will search for the jar at

```
http://repo1.maven.org/maven2/group/artifact/version/artifact-version.jar (the Central Repo)
http://repoA.corporate.com/group/artifact/version/artifact-version.jar
http://repoB.acme.com/group/artifact/version/artifact-version.jar
http://repoC.example.com/group/artifact/version/artifact-version.jar
```

stopping when it gets a hit. You can think of the list of repos maven knows about as a higher-level class path.

There is much more friendly web interface to the Central Repository at [https://search.maven.org](https://search.maven.org) though.

Try me out. Find a jar, download it, rename it to end with .zip, and unzip it to see the class files. Also, back out one level by removing the artifact-version.jar from the url, and see how the POM is is in the same 'directory' as the jar. That is how the dependencies of dependencies are discovered.

# Nexus

Nexus is software that allows you run your own repository. You can host your own jars in Nexus, and they will be available to Maven by adding the server running Nexus to the list of configured Maven repositories. Nexus will forward your request to the Central repo when it can't find a jar from its internal repository, and caches jars so it doesn't have to go back out to the Central Repo needlessly. Corporations usually run their own private repository so that they are not publishing software to the public internet. When you start a new job as a Java developer, one of the first things you do is find the url of the internal repo so you can add it to your settings.

# Wrapping It All Up

Finally, we have everything in place to understand what I was trying to do. At my tight-assed company, we have an internal Nexus repository for our own corporate proprietary jars to go because we are afraid of releasing any code to the public (even if there is not a shred of proprietary computer science contained in them). I was working on a project where I identified several natural dependencies and created those as separate Maven projects to facilitate collaboration with another team. Ideally, those dependencies would have their own build and release cycle and the jars would then be pushed to Nexus by the build server, and I wanted the ability for our group to publish jars under our group id or the group id of our organization. Then anyone could reference jars we publish by simply referring to the GAV coordinates in their pom.xml. There are work arounds when you can't publish dependencies to Nexus, but ideally building and running Java projects should be simple and should use the full power of Maven. A lot of my beliefs about software and making it easy for others to compile, change, and run are motivated by [readme driven development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html) an idea proposed by Tom Preston-Werner, the founder of GitHub. I was looking at my README and I wanted people to be able to do a simple ```mvn package``` on the main project instead of asking them to jump through a bunch of hoops just to get up and running with the project. Today, this is a standard expectation of most Java projects. It should just build and run, with maybe a little setup. If it doesn't, you're crippling people before they can even get into the code you wrote to see how it works. It's also a little irresponsible in my opinion because fixing it can sometimes be no trivial matter, and require deep expertise in narrowly focused technology.

Now back to the gate keeper I was dealing with. This guy shuts me down in several hours over email with no help from my manager. I just know that he was someone I could try, and I'm trying to do the best job I can. In my workplace, nothing is simple and explicit and no one is going to help you unless they're explicitly told to. It's unfortunate because I believe strongly in helping, talking, and empathizing with others because of the person I aspire to be, not the hat I wear at work. I also believe in open and friendly communication, and being transparent in everything I do. I don't believe in holding on to resources just so I can deny people's ability to use them. To me its just as silly as trying to keep people from using the fryer at the Sonic I used to work at...it's just a stupid 9-5 job...oh and how are people going to make fries? But trust me, this is a standard pattern of dysfunction I have observed. I call it the librarian or the gatekeeper pattern.

***Update***: My manager got right on it the next day, and marshaled some help from another person. I have to give credit when credit is due.

# Conclusion

What I was trying to do was simply get credentials so I could push my jar up to Nexus and make it available for collaboration with other teams, like the people who hand deliver source code to me on a thumb drive in our so called 'big data' environment. I know all about maven, gradle, Nexus, Jenkins, Docker, performing releases using Gitflow, orchestration with Ansible, and on and on. I have run Nexus repositories at my previous company and at home in my experimental lab running in KVM. I know the credentials are simply a user name and password. It's unfortunate that none of this affords me any influence in obtaining credentials for our group so we can use Maven the way it's intended.
