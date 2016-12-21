---
layout: post
title:  "Quickstart with Bower"
date:   2016-12-16
categories: quickstart, node, npm, bower, grunt
permalink: quickstart-bower
intro: >
  Web developers have a littany of tools available to them from the node ecosystem. Bower is a repository and command line tool for pulling in static assets like Javascript libraries and CSS frameworks.
  This post hopefully motivates what Bower does, and gets you up and running with Bower. In later posts, we will look at Grunt, Node Package Manager npm, and tie it all together with the Yeoman scaffolding tool. Nowadays, Bower is usually used with all of these tools to create highly productive workflows for web development.
---
{{page.intro}}



## Source code

If you just want to jump ahead and see the complete example, the source code for this tutorial is hosted on [Github](https://github.com/chasefranks/bower_grunt_demo.git). Just clone the repository and checkout the first commit

{% highlight bash %}
git clone https://github.com/chasefranks/bower_grunt_demo.git
cd bower_grunt_demo
git checkout 5675cfc
{% endhighlight %}

## A Simple Example

Let's start with a simple example to see what Bower does. First, you need NodeJS on your system, so head on over to [nodejs.org](https://nodejs.org) and install the version of node for the platform you're using. I'm on Linux, but it really shouldn't matter. To check that it's installed, running ```node --version```. On my system, I get

{% highlight bash %}
node --version
v6.9.2
{% endhighlight %}

With NodeJS comes the Node Package Manager (npm), which is used to install node modules. We'll use it to install Bower

{% highlight bash %}
npm install -g bower
{% endhighlight %}

Check that Bower is installed by running ```bower --version```. The latest version as of this writing is 1.8.0.

Ok, now let's get to the fun part. I want to build a site that shows off charts from a library called [Chart.js](http://www.chartjs.org). I want to use the following static assets:

* the main chart.js script
* Bootstrap for the css classes/look feel of the site
* JQuery

Let's create a directory to work in

{% highlight bash %}
mkdir -p ~/bower_example && cd ~/bower_example
{% endhighlight %}

Then we use bower to install everything we need for our project. First we initialize our project with Bower by running

{% highlight bash %}
bower init
{% endhighlight %}

just accepting the default answers to the questions it asks.

Notice that this creates a file called bower.json that will be used to record the dependencies for your project.

Now we install what we need with

{% highlight bash %}
bower install --save jquery bootstrap chart.js
{% endhighlight %}

The ```--save``` option saves the dependencies to the bower.json file:

{% highlight json %}
{
  "name": "bower_example",
  "authors": [
    "Chase Franks <clf112358@gmail.com>"
  ],
  "description": "",
  "main": "",
  "license": "MIT",
  "homepage": "",
  "ignore": [
    "**/.*",
    "node_modules",
    "bower_components",
    "test",
    "tests"
  ],
  "dependencies": {
    "jquery": "^3.1.1",
    "bootstrap": "^3.3.7",
    "chart.js": "^2.4.0"
  }
}
{% endhighlight %}

The assets are downloaded to the ```bower_components``` folder in the project directory

{% highlight bash %}
ls bower_components/
bootstrap  chart.js  jquery
{% endhighlight %}

Before Bower, we would generally have to go to each project site for Bootstrap, JQuery, and Chart.js, and download each library separately or get the link to the CDN. Now with Bower, we can get everything we need into our web projects from the command line. Nice!

Check out [Bower](https://bower.io/search/) to discover more Bower packages.

## Linking in the Bower components

Now let's create an index.html

{% highlight bash %}
touch index.html
{% endhighlight %}

and let's just start a basic html template for now.

{% highlight html %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My ChartJS Demo</title>

    <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css">
    <script src="bower_components/jquery/dist/jquery.js" charset="utf-8"></script>
    <script src="bower_components/chart.js/dist/Chart.js" charset="utf-8"></script>

  </head>
  <body>

  </body>
</html>
{% endhighlight %}

Notice the bootstrap, jquery, and chart.js assets are linked in with the usual <link> and <script> tags. That's it, no magic here!

You should be asking: what if we add more bower components, or remove ones we're not using anymore? Do I have to manage the links in each page? Won't this get tedious? Later, we'll see how to use Grunt to wire these in automatically. Grunt has a task called ```wiredeps``` that does exactly this. The idea is that you control the dependencies and their versions from the bower.json file, and ```grunt wiredeps``` inserts all of the script and link tags for javascript and css for you.

## Our Finished site
To show that the css and javascript is linked to our page, insert the following html as the body of our page

{% highlight html %}
<body style="padding-top: 30px">

  <div class="container">

    <div class="jumbotron">
      <h1>My Awesome ChartJS Demo</h1>
      <p>
        Just checking out ChartJS
      </p>
      <a class="btn btn-primary" href="#">Go to it!</a>
    </div>

    <div class="row">

      <div class="col-sm-4">
        <div class="panel panel-default">
          <div class="panel-heading">
            Example 1
          </div>
          <div class="panel-body">
            <canvas id="myChart" width="300" height="300"></canvas>
          </div>
        </div>
      </div>

      <div class="col-sm-4">
        <div class="panel panel-default">
          <div class="panel-heading">
            Example 2
          </div>
          <div class="panel-body">
            <canvas id="anotherOne" width="300" height="300"></canvas>
          </div>
        </div>
      </div>

      <div class="col-sm-4">
        <div class="panel panel-default">
          <div class="panel-heading">
            Example 3
          </div>
          <div class="panel-body">
            <canvas id="yetAnotherOne" width="300" height="300"></canvas>
          </div>
        </div>
      </div>

    </div>

  </div>

  <script type="text/javascript">
    // script for first chart
    var context1 = $('#myChart');

    var data1 = {
      labels: [
        "One", "Two", "Three"
      ],
      datasets: [
        {
          data: [10, 20, 70],
          backgroundColor: [
            "Red", "Green", "Blue"
          ]
        }
      ]
    };

    var myChart = new Chart(context1, {
      type: 'doughnut',
      data: data1
    });

    // script for bar chart
    var context2 = $('#anotherOne');

    var data2 = {
      labels: ["A", "B", "C", "D", "E"],
      datasets: [
        {
          data: [1, 2, 3, 4, 5],
          backgroundColor: "Blue"
        }
      ]
    };

    var barChart = new Chart(context2, {
      type: 'bar',
      data: data2
    });

    // script for bubble chart
    var context3 = $('#yetAnotherOne');

    var data3 = {
      datasets: [
          {
              label: 'First Dataset',
              data: [
                  {
                      x: 20,
                      y: 30,
                      r: 15
                  },
                  {
                      x: 40,
                      y: 10,
                      r: 10
                  }
              ],
              backgroundColor:"#FF6384",
              hoverBackgroundColor: "#FF6384",
          }]
      };

      var myBubbleChart = new Chart(context3, {
        type: 'bubble',
        data: data3
      });
  </script>

</body>
{% endhighlight %}

As a last step, we need to serve our page from a local web server. NodeJS has a node package called *http-server* that can serve a website from any directory. Install it with

{% highlight bash %}
npm install -g http-server
{% endhighlight %}

and start it from the project directory by invoking ```http-server```. This will start the server on port 8080 and serve our index.html. The end result should look like this:

![Awesome ChartJS Demo](/images/bower_demo_site.png)

That's it, and I hope this helped to get you started with Bower. Stayed tuned for the next post where we will introduce grunt to build our site and serve it in a local test server, and create the ```<link>``` and ```<script>``` tags automatically.
