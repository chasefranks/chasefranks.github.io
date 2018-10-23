---
layout: post
title:  "A Quick Tour of the Elasticsearch Java Client"
date:   2017-10-23
tags: [ java, elasticsearch ]
intro: >
  In this post, we will use Elasticsearch and the Java client to build a small application that lets us search a catalogue of books.
published: false
---

# Overview

Elasticsearch is a great place to store textual information. In some ways it behaves like a NoSQL document oriented database, in that it stores data in JSON format. It also provides a RESTful API for interacting with and searching through data. There are also a wealth of clients for connecting to Elasticsearch and searching in a variety of languages.

In this post, we will give a quick demo of the Java client for Elasticsearch. For an example to guide us, we will write a small application that tracks books and provides Java methods for searching the index.

**Note: This post was written for [Toptal](www.toptal.com) to express my interest in joining the Software Developers Group**.

# Project Setup

## Installing Elasticsearch

First step is to install Elasticsearch. Download the `.tar` from the

```
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.6.3.tar.gz
```

Extract it to your home directory

```
tar xvzf elasticsearch-5.6.3.tar.gz -C ~
```

Change into the `elasticsearch-5.6.3` directory and start Elasticsearch with this command

```
bin/elasticsearch
```

We should now have Elasticsearch running on our local machine, and can access it through the ports

* 9200 for the REST API
* 9300 for the transport protocol

The difference between these two protocols is that the REST API uses HTTP verbs and urls to communicate with Elasticsearch, while the transport protocol uses the Elasticsearch internal protocol for node-to-node communication. I suspect that it uses default JDK object serialization to serialize API objects to binary, and sends these directly over the network. There are advantages and disadvantages to each protocol, but let's not focus on this too much now. Just know that our examples with the Java client below are using the transport protocol under the covers to communicate over the network, while our examples with `curl` are using the REST API on port 9200. The API operations mirror each other and cause the same things to happen, we just have two ways of communicating.

As a first example, to test our new Elasticsearch cluster run

```
curl localhost:9200
```

and you should see

```json
{
  "name" : "ga2yn5a",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "gqKUyqebRvuz7JbKVlQMAQ",
  "version" : {
    "number" : "5.6.2",
    "build_hash" : "57e20f3",
    "build_date" : "2017-09-23T13:16:45.703Z",
    "build_snapshot" : false,
    "lucene_version" : "6.6.1"
  },
  "tagline" : "You Know, for Search"
}
```

## Gradle Setup

Our next step is to bootstrap a Gradle project for our application. Create a directory to hold our project

```
mkdir elastic-library && cd elastic-library
```

Then run

```
gradle init --type=basic
mkdir -p src/main/java src/main/resources src/test/java src/test/resources
```

to bootstrap a basic Gradle project. Import this project into Eclipse or your favorite IDE.

Now we need to pull in the Elasticsearch client library to our project. Open the build.gradle in your project directory, and replace the content with the following

```
apply plugin: 'java'
apply plugin: 'application'

mainClassName = 'LibraryApp'
sourceCompatibility = 1.8
targetCompatibility = 1.8
version = '1.0'

repositories {
    mavenCentral()
}

dependencies {
	// run time dependencies    
    compile 'org.elasticsearch.client:transport:5.6.2'

    // test time dependencies
    testCompile 'junit:junit:4.12'
}
```

You may need to refresh your project so that the library is added to the build path before moving on.

# Getting a Connection: The `TransportClient`

The `TransportClient` is the main entry point into the Elasticsearch Java API, so our goal will be to create a `TransportClient` instance and point it to our Elasticsearch server running on localhost. Create a new Java class called `LibraryApp` in the default package, give it a `main` method, and add the following code to it

```java
TransportClient transportClient = new PreBuiltTransportClient(Settings.EMPTY)
				.addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost"), 9300));

```

Note, the `InetAddress.getByName()` method throws an exception if your host (in this case localhost) is unknown. Just let the main method throw the exception by adding `throws UnknownHostException` to the method declaration. Our `LibraryApp` class so far looks like

```java
import java.net.InetAddress;
import java.net.UnknownHostException;

import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.transport.client.PreBuiltTransportClient;

public class LibraryApp {

	public static void main(String[] args) throws UnknownHostException {

		TransportClient transportClient = new PreBuiltTransportClient(Settings.EMPTY)
				.addTransportAddress(new InetSocketTransportAddress(InetAddress.getByName("localhost"), 9300));

	}

}
```

Let's use our client to connect and retrieve the health of our cluster. Add these two lines after our `transportClient`

```java
ClusterHealthResponse health = transportClient.admin().cluster().prepareHealth().get();
System.out.println(health);
```

Run `gradle run` and you should see our 'cluster' is in the 'yellow' state

```json
{"cluster_name":"elasticsearch","status":"yellow","timed_out":false,"number_of_nodes":1,...}
```

This shows we have made a connection to our cluster, and can get basic information about it. Let's move to something more fun, shall we?

# Indexing Some Books

The basic structure for our book data will look like:

```json
{
  "title": "But How Do It Know?",
  "description": "A breakdown of how computers work in terms human beings can understand",
  "year": 2009,
  "author": [
    "John Clark Scott"
  ]
}
```

This was a relatively recent read of mine, and instantly became one of my favorites. The description is totally made up by me, but it isn't far from the truth.

Now to get data into Elasticsearch, we first model it using an appropriate Java object. Then we call a method on our `TransportClient` to index the data. The basic format looks like

```java
transportClient
  .prepareIndex(index, type) // start a builder object to build the request
  .setSource(source)  // set the actual data to be indexed
  .get();             // execute request and return result
```

If you look at our code above to get the cluster health, you will see the similar prepare/get pattern. We'll say a little more about why the API is structured this way in a little bit, but for now let's just go with it.

The `setSource` method has 13 (by my count) different overloaded versions, which means that the Java API can accomodate many different object types for the source data. The most straightforward approach is to use a simple `Map` like so

```java
Map<String, Object> source = new HashMap<>();
source.put("title", "But How Do It Know?");
source.put("description", "A breakdown of how computers work in terms human beings can understand");
source.put("year", 2009);
source.put("author", Arrays.asList("John Clark Scott"));
```

To index it, we simply pass it to the setSource method like so

```java
transportClient
	.prepareIndex("books", "book")
	.setSource(source)
	.get();
```

Again, run this code with `gradle run`. To see our newly indexed book, run

```
curl localhost:9200/books/book/_search?pretty
```

and you should get

```json
{
  "took" : 47,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "books",
        "_type" : "book",
        "_id" : "AV9LF2Q6fdiMpCX5ovdt",
        "_score" : 1.0,
        "_source" : {
          "year" : 2009,
          "author" : [
            "John Clark Scott"
          ],
          "description" : "A breakdown of how computers work in terms human beings can understand",
          "title" : "But How Do It Know?"
        }
      }
    ]
  }
}
```

# Searching Our Index

# The Admin Client
