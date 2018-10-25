---
layout: post
title:  "Quickstart with Grunt"
date:   2016-12-21
tags: [ quickstart, nodejs, grunt, web ]
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

```
git clone https://github.com/chasefranks/bower_grunt_demo.git
```

and run

```
cd bower_grunt_demo
npm install
bower install
grunt
```

to launch the site in a local development server.

# What is Grunt?

Grunt is a task runner written in Javascript and run with NodeJS. If you're working on a web site from the terminal, you invoke grunt with

```
grunt some_task
```

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

```
npm install -g grunt
```

This just puts the grunt cli script on your ```PATH```, so you can invoke grunt anywhere from the command line. For example, running ```grunt --version``` should show

```
grunt --version
grunt-cli v1.2.0
```

What you actually installed was the grunt-cli, and invoking ```grunt``` does nothing more than delegate to a locally installed version of grunt in your project directory.

What does this mean? This means that grunt must be installed locally into each web project by running

```
npm install --save-dev grunt
```

inside of your web project folder. This installs grunt to the ```node_modules/``` directory inside of the web project, and the ```--save-dev``` option saves this to the package.json file. The package.json is used by npm, and controls which node modules your project needs and their versions. When you run ```npm install``` from the project directory, ```npm``` looks at the package.json and installs all of the node modules specified in the dependencies section:

```json
"devDependencies": {
    "grunt": "^1.0.1",
    "grunt-contrib-clean": "^1.0.0",
    "grunt-contrib-connect": "^1.0.2",
    "grunt-contrib-copy": "^1.0.0",
    "grunt-wiredep": "^3.0.1"
}
```

into the node_modules directory. Your entire project can be reassembled from the package.json. For this reason, the package.json is committed to the git repository, and the ```node_modules/``` directory is '.gitignored'.

Ok, now each task corresponds to a plugin, and each plugin is installed with npm and saved to the package.json. Let's talk about configuration. The last and most important ingredient for grunt to work is the ```Gruntfile.js``` file. This file starts with a wrapper

```
module.exports = function(grunt) {
  // config goes here
}
```

If you know a little about how Node modules and the NodeJS function ```require()``` works, you can probably guess that this file gets required somewhere, exports a configuration function (the function we're defining), which then gets invoked, passing in an object referenced by the grunt parameter.

Configuring the plugins is done by invoking ```grunt.initConfig(config)```, where config is a javascript object. This object needs to have a key for each task. For example, to configure the clean plugin, the config object would start with

```
{
  "clean": // config for clean
}
```

and our Gruntfile would look like

```js
module.exports = function(grunt) {
  grunt.initConfig({
      "clean": // config for clean task
  })
}
```

Notice that the config object is being defined literally as the parameter to the init method using javascript object notation.

To configure each plugin, you refer to its documentation on it's website. For example, clean is documented [here](https://www.npmjs.com/package/grunt-contrib-clean), and you should be able to see that all we have to do is tell it which directories to clean (the short format mentioned in the docs, right?). For this tutorial, it will be the ```dist/``` directory we will create, so we can simply do

```js
module.exports = function(grunt) {
  grunt.initConfig({
      "clean": "dist"
  })
}
```

to configure the clean plugin. Lastly, we register the task with grunt using `grunt.loadNpmTasks()`

```js
module.exports = function(grunt) {
  grunt.initConfig({
      "clean": "dist"
  })

  grunt.loadNpmTasks('grunt-contrib-clean');
}
```

Other plugins will have more involved configuration, but the pattern is the same:

1. Find the plugin you need from [Grunt Plugins](http://gruntjs.com/plugins) site.
2. Install it with ```npm install --save-dev <plugin>```.
3. Pass configuration from the docs to the ```grunt.initConfig()``` method by adding a key for your task.
4. Load the task with ```grunt.loadNpmTasks()```.

If you understand this, you know everything you need to know to use grunt.

Try it out by running through the steps above and running ```grunt clean```. You should see the dist directory is simply deleted.

# Setting up our Project with Grunt

Now let's get started. If you followed the steps above to install grunt, you're already ahead. If not go ahead and run ```npm install -g grunt```.

Open a terminal from the project directory, and let's get a basic package.json started to save our node dependencies. Run

```
npm init
```

and plug through the questions it asks. After it's done, you should have a package.json file which looks something like mine

```json
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
```

Now install grunt locally by running ```npm install --save-dev grunt```.

Lastly, go ahead and create a Gruntfile.js (```touch Gruntfile.js```) and start it off with the following contents

```js
module.exports = function(grunt) {
  grunt.initConfig({
    // config for each task goes here
  })
}
```

We're all set for configuring our first task, the wiredep task.

# Wiring in Bower dependencies with grunt wiredep

Remember that we want to be able to have our bootstrap.css, .js, and charts.js assets linked in automatically to our index.html. Why do it this way? What's the benefit...it's only a few ```<script>```and ```<link>``` tags.

The idea is that generally, we will have a *lot* of bower components. We want to control these (and their versions) only through the bower.json file, and know that our changes will be dynamically inserted. This is a level of abstraction we're introducing. Just like the pom.xml file controls the dependencies for a java project, the bower.json controls the static asset dependencies for a web project. We know that if we change the pom.xml, everything downstream in the build process will reflect that change. Similarly, everything in our website is sort of controlled by the bower.json.

![bower flow](/images/bower_flow.png)

This is why we need something like bower and a task like wiredep.

The plugin we need is called [grunt-wiredep](https://www.npmjs.com/package/grunt-wiredep). We install it with

```
npm install --save-dev grunt-wiredep
```

The documentation should be easy to follow, but sometimes the simplicity gets lost. In our index.html, we have

```html
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css">
<script src="bower_components/jquery/dist/jquery.js" charset="utf-8"></script>
<script src="bower_components/chart.js/dist/Chart.js" charset="utf-8"></script>
```

and we want those to be automatically generated when we run our ```wiredep``` task. All we do is replace the explicit tags with html comments

```html
<!-- bower:js -->
<!-- endbower -->
```

for our javascript assets, and

```html
<!-- bower:css -->
<!-- endbower -->
```

for our bootstrap css, or any other css we link in through bower.

Next, lastly we need to configure the wiredep task, which essentially means telling wiredep which files to scan for the placeholder comments. Change the Gruntfile.js to look like this:

```js
module.exports = function(grunt) {
  // grunt configuration goes here
  grunt.initConfig({
    // tasks go in here, for example...the first one will be wiredep
    wiredep: {
      task: {
        src: [ // list of files to inject bower dependencies into
          'index.html'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-wiredep');
}

```

Lastly, try it out by running ```grunt wiredep``` in a terminal.

You should notice that the javascript .js files get wired in, but there's a problem with the Bootstrap css file. Turns out this is a known issue that you can read about [here](http://blog.getbootstrap.com/2015/06/15/bootstrap-3-3-5-released/). To fix it we need to override the bower.json that comes with the Bootstrap bower package. Add the following section to our bower.json file

```json
  ...
  "overrides": {
    "bootstrap": {
      "main": [
        "dist/js/bootstrap.js",
        "dist/css/bootstrap.css",
        "less/bootstrap.less"
          ]
      }
  }
```

Now running ```grunt wiredep``` should link in the css.

# Launching a Development Preview Server with ```grunt-contrib-connect```
