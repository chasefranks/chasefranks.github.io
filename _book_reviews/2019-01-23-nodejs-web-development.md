---
layout: book-review
title:  NodeJS Web Development 4th Edition
author: David Herring
date:   2019-01-23
categories: review
intro: >
  David Herring's book is a great and opinionated introduction to NodeJS. He takes you through developing an entire notes web application with Express and MongoDB, but along the way you are introduced to the microservice methodology as well as different databases and tools. I found the book to be a great read, and would recommend it to anyone wanting to get up and running with writing web applications in Express with Handlebar templates.
permalink: /books/reviews/nodejs-web-development
published: true
disqus_id: nodejs-web-development
---
{{page.intro}}

## How I Read It

I found it necessary to read chapter by chapter, since it is taking you through the development of a web application. I also wrote the code along with the book, something I strongly recommend on a first read. Along the way, you will encounter some errors where he references ejs templates, probably from a previous edition. I found it easy to correct for those.

## Favorites

One of the parts I liked the most is in Chapter 7, where you go through the process of converting the CommonJS modules for the sample web application into ES6 modules. This really helped reinforce what you are doing when you `import` a CJS module...whatever object is exported by `module.exports` is the default export as an ES6 module.

Another aspect I liked is the use of `async`/`await` throughout, and how it was motivated in earlier chapters by the callback hell problem. Coming from a Java background, I can't say that this is a problem that manifests itself in that realm. Not that it can't, it's just not easy to do. In Javascript, this it's really easy to do (Look at my refresh-tags.js script in the repo for this blog).

This is because the natural programming style in Javascript is called continuation passing style (CPS), and it what sets you up for call back hell. The building block is the typical Javascript asynchronous function

```js
asyncTask(done) {
    // do something that takes a while and produces a result
    let result = ...;
    // invoke the callback with the result
    done(result);
}
```

`done` is a function that defines what you want to do once you get the result. To actually use `asyncTask`, you might naturally define `done` inline while passing it in

```js
asyncTask(function(result) {
   // do something with result
})
```

Now bear with me. What if what you need to do is invoke another asynchronous task only after the first result is received? Answer: You gotta chain...

```js
asyncTask(function(result) {
    // now that I have the result
    anotherAsyncTask(function(nextResult) {
        // do something with next result
    });
});
```

It is a common situation to need to chain asynchronous tasks together in this way, where the result of a task is passed to the next task in the chain. As you chain more of the tasks together, it becomes harder to read and follow the code as the level of indentation increases. This is the problem `async`/`await` solves. The asynchronous function invocation above would look like

```js
let result = await asyncTask();
// do something with result

let nextResult = await anotherAsyncTask();
```

I'm glad this was emphasized and used so ubiquitously in the book. It really got me capable with the superior `async`/`await` form in my day-to-day work.

## Critique

I thought the discussion in Ch 8, around Passport and Express sessions could have been clarified a little more. The flow seemed a little out of order for someone writing the code with the book. I would've started for example with just adding session support, and then added Passport. I could've used a little more explanation on how Passport uses the session since it seems magical how it works.

Also, the way the `Note` model class was written (using the `Symbol` instead of explicit member names) escaped me on a first read. It seemed a bit esoteric for an introductory book. I think later on a simpler version is used so it's not really a big distraction.
