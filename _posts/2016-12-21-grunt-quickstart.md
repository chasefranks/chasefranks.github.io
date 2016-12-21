---
layout: post
title:  "Quickstart with Grunt"
date:   2016-12-21
categories: quickstart node bower grunt
intro: >
  In a previous [post](/quickstart-bower) we looked at getting a basic website up and running
  with bower. In this post, we continue our series by looking at [Grunt](http://gruntjs.com/), which is
  like Maven for web developers. Starting from our example website we built with Bower, we will use grunt
  to automate some tasks we will want to do to make our site better and easier for developers to work with.
  Hopefully this tutorial inspires you to learn more about grunt and integrate it into your daily workflow.
published: true
---
{{page.intro}}

# Source Code
The complete source code for this tutorial is hosted on [Github](https://github.com/chasefranks/bower_grunt_demo.git). Just clone the repository

{% highlight bash %}
git clone https://github.com/chasefranks/bower_grunt_demo.git
{% endhighlight %}

and run

{% highlight bash %}
cd bower_grunt_demo
npm install
bower install
grunt
{% endhighlight %}

to launch the site in a local development server.

# What is Grunt?

Grunt is a task runner written in Javascript and run with NodeJS. If you're working on a web site from the terminal, you invoke grunt with

{% highlight bash %}
grunt some_task
{% endhighlight %}

where *some_task* is something useful that grunt does for you. When you first install grunt, initially it isn't really capable of doing anything. You have to install
plugin for each task you want to do. So to see what grunt is capable of doing, you need to see the [list](http://gruntjs.com/plugins) of plugins available. Grunt has great community
support. If you can't find a plugin that does what you want, you can easily write your own and make it available for others to use.

We will use four plugins in this tutorial:

* wiredep, to wire in our bower dependencies
* contrib-clean, just deletes a directory (we call this cleaning when deleting build artifacts)
* contrib-connect, start up a local development web server for previewing our site
* contrib-copy, just copies a folder

# How does Grunt work?

Each task corresponds to a grunt plugin, and grunt and all of it's plugins are nothing more than node modules that can be installed with ```npm```. We install grunt as a *global* node module with

{% highlight bash %}
npm install -g grunt
{% endhighlight %}

This just puts the grunt cli script on your ```PATH```, so you can invoke grunt anywhere from the command line. For example, running ```grunt --version``` should show

{% highlight bash %}
grunt --version
grunt-cli v1.2.0
{% endhighlight %}

What you actually installed was the grunt-cli, and invoking ```grunt``` does nothing more than delegate to a locally installed version of grunt in your project directory.

What does this mean? This means that grunt must be installed locally by running

{% highlight bash %}
npm install --save-dev grunt
{% endhighlight %}

inside of your web project folder. This installs grunt to the ```node_modules/``` directory inside of the web project, and the ```--save-dev``` option saves this to the package.json file. The package.json is used by npm, and controls which node modules your project needs and their versions. When you run ```npm install``` from the project directory, ```npm``` looks at the package.json and installs all of the node modules specified in the dependencies section:

{% highlight json %}
"devDependencies": {
    "grunt": "^1.0.1",
    "grunt-contrib-clean": "^1.0.0",
    "grunt-contrib-connect": "^1.0.2",
    "grunt-contrib-copy": "^1.0.0",
    "grunt-wiredep": "^3.0.1"
}
{% endhighlight %}

into the node_modules directory.

Ok, now each task corresponds to a plugin, each plugin is installed with npm and saved to the package.json. Let's talk about configuration. The last and most important ingredient for grunt to work is the ```Gruntfile.js``` file. This file starts with a wrapper

{% highlight javascript %}
module.exports = function(grunt) {
  // config goes here
}
{% endhighlight %}

If you know a little about how Node modules and the NodeJS function ```require()``` works, you can probably guess that this file get's required somewhere, exports a configuration function (the function we're defining), and gets invoked.

Configuring the plugins is done by invoking ```grunt.initConfig(config)```, where config is a javascript object. This object needs to have a key for each task. For example, to configure the clean plugin, the config object would start with

{% highlight javascript %}
{
  "clean": // config for clean
}
{% endhighlight %}

and our Gruntfile would look like

{% highlight javascript %}
module.exports = function(grunt) {
  grunt.initConfig({
      "clean": // config for clean task
  })
}
{% endhighlight %}

Notice that the config object is being defined literally as the parameter to the init method using javascript object notation.

To configure each plugin, you refer to its documentation on it's website. For example, clean is documented [here](https://www.npmjs.com/package/grunt-contrib-clean), and you should be able to see that all we have to do is tell it which directories to clean (the short format mentioned in the docs, right?). For this tutorial, it will be the ```dist/``` directory we will create, so we can simply do

{% highlight javascript %}
module.exports = function(grunt) {
  grunt.initConfig({
      "clean": "dist"
  })
}
{% endhighlight %}

to configure the clean plugin. Lastly, we register the task with grunt using `grunt.loadNpmTasks()`

{% highlight javascript %}
module.exports = function(grunt) {
  grunt.initConfig({
      "clean": "dist"
  })

  grunt.loadNpmTasks('grunt-contrib-clean');
}
{% endhighlight %}

If you understand this, you know everything you need to know to use grunt. Other plugins will have more involved configuration, but the pattern is the same. We configure the task by passing a configuration object keyed under the task name, abd register the task with ```loadNpmTasks()```. Try it out by running ```grunt clean```. You should see the dist directory is simply deleted.

# Setting up our Project with Grunt

If you already installed grunt, great. If not go ahead and run ```npm install -g grunt```.

From the project directory, let's get a basic package.json started to save our node dependencies. Run

{% highlight bash %}
npm init
{% endhighlight %}

and plug through the questions it asks. After it's done, you should have a package.json file which looks something like mine

{% highlight json %}
{
  "name": "bower_example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
{% endhighlight %}

Now install grunt locally by running ```npm install --save-dev grunt```.

Lastly, go ahead and create a Gruntfile.js (```touch Gruntfile.js```) and start it off with the following contents

{% highlight javascript %}
module.exports = function(grunt) {
  grunt.initConfig({
    // config for each task goes here
  })
}
{% endhighlight %}

We're all set for configuring our first task, the wiredep task.

# Wiring in Bower dependencies with grunt wiredep

Remember that we want to be able to have our bootstrap.css, .js, and charts.js assets linked in automatically to our index.html. Why do it this way? What's the benefit...it's only a few ```<script>```and ```<link>``` tags.

The idea is that generally, we will have a *lot* of bower components. We want to control these (and their versions) only through the bower.json file, and know that our changes will be dynamically inserted. This is a level of abstraction we're introducing. Just like the pom.xml file controls the dependencies for a java project, the bower.json controls the static asset dependencies for a web project. We know that if we change the pom.xml, everything downstream in the build process will reflect that change. Similarly, everything in our website is sort of controlled by the bower.json.

![bower flow](/images/bower_flow.png)
