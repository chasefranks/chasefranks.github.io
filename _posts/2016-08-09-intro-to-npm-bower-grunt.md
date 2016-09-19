---
layout: post
title:  "An intro to npm, bower, and grunt."
date:   2016-09-18
categories: workflow, node
intro: >
  I've started on a new project at work, and git clone the project as usual. I see my old friend pom.xml for building with Maven. I also see that they're using Node.js to automate building the static content for the site
  as well as Grunt to preview the site in a local web server. I've always sort of just kludged my way through the commands to build static content, ```npm install```, ```bower install```, etc. In this post, I will take a closer look at what these commands do, as well as hopefully give a feel for the larger picture of the build process for a real production website.
published: false
---
{{page.intro}}

## Node Package Manager (NPM)

First, let's start with the package manager for Node.js applications, [Node Package Manager](https://www.npmjs.com/) or npm for short. This comes standard with installation of [Node.js](https://nodejs.org/en/). Node.js was created from the javascript engine used in the Chrome web browser, and is a standalone runtime environment for javascript. This means you can run a javascript file with ```node myscript.js```. There is so much more to Node.js than this, and I encourage you to install it and take a look around.

After installing Node.js, you can use the ```npm``` command to install node packages. There are two ways to install packages, either globally using ```npm install -g <package>``` or locally to your project directory ```npm install <package>. When you install globally, you are basically adding the package to your node installation and a new command to your $PATH. When you install locally, npm creates a node_modules folder in your project and puts the installed package there. We'll use both commands below, so just keep this distinction in mind for now.

The NPM site has over 300,000 packages you can install with npm. There are some great command-line tools available (for example ```jsonlint```). Everything we discuss below (bower, grunt) comes from the npm ecosystem as a node package, and you should think of it as the base of our tool stack.

### An Example

Let's work through a little example to see how this works. We will basically write a small application in Node.js that <<insert super easy node app here>>.

## Bower

## Grunt

## Yeoman - A Web Scaffolding Tool
