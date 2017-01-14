---
layout: post
title:  "Use bootlint To Fix Your Bootstrap"
date:   2017-01-14
categories: css bootstrap linting
intro: >
   As this blog progresses, the time is probably ripe for me to fix some css errors that have cropped up. I'm not real happy with my recent addition of the Bootstrap ```affix``` plugin to make my nav bar stick to the top. Also, the new banner image I've added doesn't have the responsive behavior I want. I started trying to clean up the code, and stumbled on a tool called [bootlint](https://github.com/twbs/bootlint) through the power of Google.


   bootlint is a tool that can scan your html for common mistakes when using the Bootstrap framework. In this post, we'll use bootlint to fix the default layout of this blog. What bootlint uncovered when I scanned this blog was horrifying, but was just the reality check I needed to go about fixing the layout.
published: true
---
# Introduction

{{page.intro}}

# Installing bootlint

bootlint is available as a node [module](https://www.npmjs.com/package/bootlint), and is easily installed using npm. For this tutorial, we'll just install the command line tool as a global module

{% highlight bash %}
npm install -g bootlint
{% endhighlight %}

# Running bootlint

Like most tools that are awesome, bootlint accepts input from stdin, so we can just pipe the output from ```curl```ing this blog's url right into the tool, just like this...

{% highlight bash %}
curl http://localhost:4000 | bootlint
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  9569  100  9569    0     0  1452k      0 --:--:-- --:--:-- --:--:-- 1557k
<stdin>:59:5 E004 Containers (`.container` and `.container-fluid`) are not nestable
<stdin>:188:5 E004 Containers (`.container` and `.container-fluid`) are not nestable
<stdin>:30:5 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:32:3 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:33:5 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:191:24 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:192:37 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:192:102 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:195:24 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:196:24 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:199:24 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:201:24 E013 Only columns (`.col-*-*`) may be children of `.row`s
<stdin>:33:5 W012 `.navbar`'s first child element should always be either `.container` or `.container-fluid`

For details, look up the lint problem IDs in the Bootlint wiki: https://github.com/twbs/bootlint/wiki
13 lint error(s) found across 1 file(s).
{% endhighlight %}

In this example, I'm running my blog on localhost port 4000 using ```jekyll serve```, but you could just as well fetch the page directly from Github pages with ```curl https://chasefranks.github.io```.

# The Verdict

You can see bootlint found two types of errors, E004, E013, and a warning, W012. Following the advice from the command line, we look up these codes in the [wiki](https://github.com/twbs/bootlint/wiki) and find

|-----------------+------------|
| Code | Description|
|-----------------|------------|
| [E004](https://github.com/twbs/bootlint/wiki/E004) | Containers (.container and .container-fluid) are not nestable |
| [E013](https://github.com/twbs/bootlint/wiki/E013) | Only columns (.col-*-*) may be children of .rows |
| [W012](https://github.com/twbs/bootlint/wiki/E013) | .navbar's first child element should always be either .container or .container-fluid |

Taking a look at the source being generated, bootlint is spot on. There's a problem somewhere between where my main content starts (line 59)

{% highlight html %}
...
<div class="container">

      <div class="blog-header">
        <h2 class="blog-title">Drive2Code</h2>
        <p class="lead blog-description">A blog about Java, Spring, and being a developer.
</p>
      </div>
...
{% endhighlight %}

and where my footer begins (line 188)

{% highlight html %}
...

    </div><!-- /.container -->

    <div class="container-fluid blog-footer">
  <div class="row">
    <div class="col-sm-4">
...
{% endhighlight %}

In short ,the bootstrap ```.container``` and ```.container-fluid``` classes don't nest.  In the Bootstrap grid system, the intended hierarchy of container, row, and column classes looks something like

{% highlight html %}
<div class="container">
  <div class="row">
    <div class="col-md-6">
      <!-- content -->
    </div>
    <div class="col-md-6">
      <!-- content -->
    </div>
  </div>
  <div class="row">
    <div class="col-md-8">
      <!-- content -->
    </div>
    <div class="col-md-4">
      <!-- content -->
    </div>
  </div>
  ...
</div>
{% endhighlight %}

This explains the second error, for example line 30

{% highlight html %}
<div class="row">
  <div id="header-img"/>
</div>
{% endhighlight %}

shows that my banner image div is a child of row that is not a ```.col-*-*```.

Anyway, I'll spare you the gory details of fixing these sort of nesting errors. While I'm here, I also see that I need to get my indenting house in order.

# Conclusion

I'll just say that the right thing to be thinking at this moment is

> How do I integrate this check into the build lifecycle of this site?

Anyway, that's what I'm thinking at least and I'll post on it when I figure it out. In any event, bootlint found some obvious mistakes and provides a nice dictionary of error codes and problem descriptions. I'm well on my way to getting the layout fixed.
