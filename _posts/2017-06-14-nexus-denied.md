---
layout: post
title:  "Nexus Denied"
date:   2017-06-14
categories: devops silos
intro: Read more to find out how my organization denied my right to publish jars today...
published: true
---

So I would like to relate something that happened today, that is a sort of follow up from my previous [post](/ramblings/2017/06/12/the-twilight-zone.html) about fiefdom building, and how IT organizations basically deny developers the tools they need. If you can't tell from this blog, I am a Java developer. I work on a small, highly fragmented team, in a low-to-no trust environment. Because of my technical expertise, not only in Java, but other areas like continuous integration and deployment, I am able to take software from source code to a production deployment, and frequently contribute my expertise to help teams set up their release cycles and build pipelines. Well, today I needed something I thought was a no brainer...push credentials into a Nexus repository so I could make a jar available to maven builds executed on the corporate intranet. I first simply sent an email to my manager asking for the credentials (they are usually username/password that you can encrypt and add to your maven settings). After being ignored for a day, I went to someone I had in my head as our DevOps liason. Of course, this person's role was never made clear to me, no introductions were ever made, and the only previous correspondence was broken email sparring over some trivial issues with Nexus/Jenkins that never got resolved and resulted in builds I had to orphan. I emailed this person, with my manager CC'd on the chain. We went back and forth several times, with my manager silently trolling, never once replying to help me as I tried to make my business case and the conversation was going south. In any event, after several exchanges, I have basically been denied credentials to our official Nexus repository for publishing jars within the corporate intranet.

I want to take a step back and explain what I'm talking about here, along with some helpful and colorful commentary.

# maven

Maven is a build tool for compiling Java code. A developer works by editing what are essentially text files saved with a name like MyClass.java. Each text file is compiled to a Java class file, which is no longer text, but binary data that the Java virtual machine loads and runs.

```
MyClass.java ---> MyClass.class
```

This process is what is referred to as compiling the java code. It can be done by hand with the ```javac``` command that you get when you install the Java Development Kit (JDK).

In practice, you are working on anywhere from 50 to 200 .java files for a project, maybe more. The resulting 50 to 200 class files are assembled into something called a Java Archive (.jar) which is nothing more than a zip compressed archive of your java classes. You can unzip the jar and see the .class files anytime you like. Producing the .jar file is called building, and the resulting .jar file is called the build or the artifact. The jar file is a fundamental deliverable unit for a team of software developers. It is our version of the widget if you like.

Maven is a tool that you install that will handle building the jar for you. With a simple command (```mvn package```) run from your project directory, all of the .java text files will be compiled into binary .class files, and those class files will be assembled into a .jar file. This is one half of what Maven does. In this way, it's very much like ```make``` used for C/C++.

The other half of what Maven does is oh, so much more sweet. To really taste Maven, we need to talk about software dependencies.

## compile-time dependencies

Your project will use Java classes that other people have wrote, and are available in jar files downloadable from the internet. These classes, jars, are collectively referred to your dependencies. They are the java projects that your project depends on. Now, you can write your code in .java files and refer to any class you like, yours, someone elses, imaginary, etc. When you go to compile this class, the ```javac``` uses something called a classpath, which in practice is a set of jars, to find the external classes you are referring to to make sure you're using those classes in a sane way. If it can't find the class you are trying to rely on in a jar on the classpath, you get a compile-time error. The classes you are explicitly relying on by referring to them directly in your .java text files are called *compile-time* or *build-time dependencies*, and the classpath passed to the ```javac``` compiler is sometimes called the *build path*.

What Maven does is allow you to simply refer to a jar file on the public internet using three coordinates:

* groupId...who is publishing this jar? Walmart, Spotify, etc. Could even be sub organizations, like Walmart accounting.
* artifactId...an id to specify this jar among all the Java projects this group produces.
* version...for this artifact, what version is it? 1.0.0, 1.0.5, 2.0.0, etc.

These are referred to as the GAV coordinates of the jar or dependency, and all you have to do is add the GAV tuple for a jar to a text file that maven uses called the POM. Since the POM file has an xml format, a dependency listing looks something like

```xml
<dependency>
	<groupId>io.reactivex</groupId>
	<artifactId>rxjava</artifactId>
	<version>1.2.7</version>
</dependency>
```

The GAV coordinates are sometimes referenced using a short hand groupId:artifactId:version, for example

```
io.reactivex:rxjava:1.2.7
```

That's it! Maven will go out to the internet, download the jar for each GAV coordinate you specify, and when you build by invoking ```mvn package```, those jars are implicitly added to the build path. What you would have to do without maven is find and download each jar from the internet, place it into a directory, and list this directory in your classpath. For a few dependency jars, this is not a problem. But if you have even 10 jars with their concomitant versions that need to be downloaded, then when a version changes it has to be fetched and added to the class path all over again, and you will get cranky and begin to have dry skin. It's tedious and error prone, and not to mention, without the central POM file maven uses, they wouldn't even be listed anywhere. They would be discovered by running the build 50 times, each time using the resulting error to find the jar you need to add. Actually the build error only tells you the class that javac couldn't find, and you have to use magic to find what jar on the internet contains that class, and I'm done talking about this...

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

Maven again has done the work for you. Since [version 2.0](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html), the classpath maven uses for your builds is automatically populated with the full dependency tree derived from your POM. It starts with the direct dependencies listed in your POM, and adds those jars to your classpath. Then for each one of your direct dependencies, it goes to their POM and gets their dependencies and adds them to the classpath. This basically continues recursively with some conflict management taking place along the way. This means maven can also run your code when it needs to as well, which facilitates unit testing, building a runnable jar, etc.

# Maven Repositories

Now all you need to do is list the dependencies you need by adding their GAV coordinates to the POM file. If you think a bit, this is a little too generic. GAV coordinates are used for locating jars, but there's nothing in the group, artifact or version, that says where to go on the internet to get that jar. This is because maven searches for the jar from among a list of repositories, which are web sites that make jars available at a certain url pattern. For example, a jar with GAV coordinates: group=com.walmart, artifact=shopping-cart, 1.0.0 would be hosted at a repository website (say http://repo for simplicity) at

```
http://repo/com/walmart/shopping-cart/1.0.0/shopping-cart-1.0.0.jar
```

Your installation of maven has a configurable list of repositories, and it checks urls like the one above in sequence until it gets an HTTP 200, code for 'I found it'. You can think of the list of repos maven knows about as a higher-level classpath.

There is one repository website that comes built into Maven, and is where all Java developers first learn to shop. It is called the **Central Repository**, and the actual repository is at [http://repo1.maven.org/](http://repo1.maven.org/). There is much more friendly web interface at [https://search.maven.org](https://search.maven.org) though.

Try me out. Find a jar, download it, rename it to end with .zip, and unzip it to see the class files. Also, see how the POM is is in the same 'directory' as the jar. That is how the dependencies of dependencies are discovered.

If you are an open source Java developer, and want to make your jar available for others to use it in their maven projects, the Central repo is where you want it to be. If you work for a tight-assed corporation like I do that thinks being secretive creates 'value', then you may want the benefits of maven but don't want to allow your developers to upload jars for every one to use.

Don't think I have a point? Again try me out. Do yourself a favor and search for 'netflix' on the Central repo. You will see them all over the place with some of the most fascinating contributions to open source Java to date in my opinion. They took the Java jars that resulted from solving the same problems that keep your Netflix service streaming without interruption, and made them available for everyone to use. They published their shit to the Central Repo and went back to being awesome and designing more software. They are also confident enough to know where there true value lies, which is why they think developers being able to run a build over an airport wifi connection is important.

Here's another one, search for 'spotify', another company that offers uninterupted streaming. They even contribute a plugin for maven for building Docker images from jars.

I don't understand this reflexive tendency to want to hide everything because your afraid of being out done. I would think the natural impulse for a company would be to encourage and facilitate their developers to be open source contributors. My theory is that most corporations do not have relaxed and mentally competent people who are in the right state to carefully identify what is really valuable.

# Nexus

Finally, we have everything in place to understand what I was trying to do. At my tight-assed company, we have an internal repository for our own corporate proprietary jars to go. This repository is a server running software called Nexus, which is essentially a special purpose web server like all repositories. Nexus allows you to host your corporate jars internally, and forwards your request to the Central repo when it can't get a hit on your GAV coordinates.

# Conclusion

What I was trying to do was simply get credentials so I could push my jar up to Nexus and make it available for collaboration with other teams, like the people who are within line of sight of me and hand deliver code to me on a thumb drive. I know all about maven, gradle, Nexus, Jenkins, Docker, performing releases using Gitflow, orchestration with Ansible, and on and on. I have run Nexus repositories at my previous company and at home in my experimental lab running in KVM. I know the credentials are simply a user name and password.

> This is literally all I do, all day long.

I get paid well to write Java code and build jars with maven. This guy responds back telling me that I'm not the 'release engineer', so releases builds aren't my job. Release engineer sounds like some made up concoction from someone trying to hold on to their job. What the fuck does a release engineer do after the automated pipeline is set up and stable? This is what DevOps is mostly about, the ingredients for deployment are in source code, and the 'who' is injected at deployment time through credentials, secrets, and environment variables. You get there by making dev, test, and prod environments identical.
