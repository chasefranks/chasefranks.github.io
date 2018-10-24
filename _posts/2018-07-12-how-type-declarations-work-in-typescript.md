---
layout: post
title: How `@types` Work in Typescript
date:   2018-07-12
tags: [ nodejs, javascript, typescript ]
intro: >
 One of the things that's always been sort of a mystery to me is how `@types` work in Typescript. You encounter this when you are working in Typescript, but you want to bring in your favorite library like RxJS or lodash, which are untyped Javascript libraries. Let's unravel the mystery in this post.
permalink: how-type-declarations-work-in-typescript
disqus_id: how-types-work-in-typescript
published: true
---
{{page.intro}}

## Getting Started

First, let's make sure we have the typescript compiler installed globally on our system:

```
npm install -g typescript
```

Let's test that it installed and what version we have with `tsc -v`

```
tsc -v
Version 2.9.2
```

Finally, let's lay out some directories for our project:

```
mkdir -p \
  types-tutorial \
  types-tutorial/src \
  types-tutorial/dist
```

The `/src` folder is where our Typescript source files will go, and `/dist` is where we will put the compiled javascript. Let's tell the compiler to do this by creating a file called `tsconfig.json` with this content

```json
{
    "include": [
        "src/**/*"
    ],
    "compilerOptions": {
        "outDir": "dist"
    }
}
```

and placing this file at the root of our project.

## What Is Typescript

[Typescript](http://www.typescriptlang.org) is a typed superset of Javascript. Let's break down what this means by example.

*Superset* in this context means that I can write the same good old javascript I'm used to, and Typescript will understand. It also means that I'm not breaking any Typescript rules when I do. In effect, Typescript is javascript and then some.

Let's create a script called `my-script.ts` in the src folder with this content:

```js
var add = function(a,b) {
    return a + b;
}

console.log('Is it 10:', add(3,7), "?")
```

The `.ts` file extension is used to denote typescript source code, but there is nothing special about this script...it is just plain javascript.

Now let's compile it by invoking `tsc` inside of our project directory:

```
tsc
```

You should see this file get created in the dist directory as part of the build output

```js
var add = function (a, b) {
    return a + b;
};
console.log('Is it 10:', add(3, 7), "?");
```

Apart from some cosmetic changes, the compiler really didn't do much with our typescript source `my-script.ts`. Let's give it a run

```
node dist/my-script.js
Is it 10: 10 ?
```

I can run the typescript source as well since it is the same javascript, only a different file name

```
node src/my-script.ts
Is it 10: 10 ?
```

So far, the `tsc` step appears to be unnecessary.

What does it mean that Typescript is *typed*? Let's say I try to use our add function in a different way:

```js
console.log('Is it 10:', add(3,'7'), "?")
```

Now when I compile and run as before, I get

```
Is it 10: 37 ?
```

`3 + '7'` turns into string concatenation in javascript because I've made 7 into a string by quoting it. Instead of getting `10`, I get `'37'`. That's not how we really intended our `add` function to be used, but it's perfectly valid javascript and this behavior is actually part of the behavior of javascript, as a *dynamically typed* language.

We can fix this by using Typescript types. Let's extend our javascript code in `my-script.ts` to the Typescript realm by 'typing' the arguments to add

```js
let add = function(a: number, b: number): number {
    return a + b;
}

console.log('Is it 10:', add(3,'7'), "?")
```

Now when I try to compile with `tsc`, I get an error

```
src/my-script.ts:5:32 - error TS2345: Argument of type '"7"' is not assignable to parameter of type 'number'.

5 console.log('Is it 10:', add(3,'7'), "?")
                                 ~~~
```

The compiler tells us that the string '7' can't be passed in to add which expects a number.

We don't get build output in `dist` for this file, and this code never goes to production to wreak havoc. This is called compile-time type checking, because it happens at compile time.

## Modules

Ok, let's pretend that this `add` function is really valuable, and we want to share it with others. We need to create a module. Let's create a directory at the top level called `adder` and put our plain javascript version of add in a file called index.js at the top level:

```
mkdir adder && touch index.js
```

```js
var add = function(a, b) {
    return a + b;
}

module.exports = {
    add: add
}
```

Now, let's forget about Typscript for a second and think about how we would use this as a plain javascript module. Well, the word `module` is sort of overloaded in the JS community at the moment. Let me break down the types of Javascript modules *I* know about:

* CommonJS - use in javascript running in NodeJS
* ES6 modules - introduced by the ECMAScript 2015 Language Specification, need something like Babel to compile since most browsers and even NodeJS aren't quite there yet.
* Typescript modules - Typescript's notion of a module...very similar in notation to ES6

We are in the context of plain javascript running in NodeJS, so we just created a CommonJS module. To use it, we `require` it at the top of our script like so:

```js
const adder = require('../adder');
```

The `..` means go up one directory from our `src` (because we put `adder/` at the project root), and inside of the module folder, NodeJS knows to look for the `index.js` by default. The `adder` constant gets whatever the value of `module.exports` is, in this case an object with a single key `add` referencing the value which is our function. To use it, we would then do

```js
console.log('Is it 10:', adder.add(3,'7'), "?");
```

We can run this from source, but we can't compile it (did I just say that?) because Typescript doesn't understand the `require`:

```
tsc
src/my-script.ts:1:15 - error TS2304: Cannot find name 'require'.

1 const adder = require('../adder');
                ~~~~~~~
```

```
node src/my-script.ts
Is it 10: 37 ?
```

Let's make it into a Typescript module by using the `import` statement in our `my-script.ts`

```js
import { add } from '../adder';
```

Now compile it, and let's see what it compiles to in `/dist/my-script.js`

```js
"use strict";
exports.__esModule = true;
var adder_1 = require("../adder");
console.log('Is it 10:', adder_1.add(3, '7'), "?");
```

This is a **crucial** point on our way to understanding how `@types` and type declarations work. The Typescript compiler produced something basically equivalent to our plain javascript which used the CommonJS `require` statement. How did it know we were using CommonJS? The point is that it that the compiler can be told to target different module systems by setting the `--module` argument on `tsc`. You can find a full list of flags you can pass to the compiler [here](http://www.typescriptlang.org/docs/handbook/compiler-options.html). This logic of this flag combined with the default value of the `--target` flag means that CommonJS is selected as the default for `--module`. The moral of this story is that Typescript targets a module system, and CommonJS is the default target. This is how the token `import` which comes from Typescript module syntax compiled to `require` from the CommonJS syntax, using `tsc` right out of the box.

Now that you understand this, let's move on to type declarations.

## Type Declarations

Now let's pretend that we are the maintainer of this `adder` module written in plain javascript. We're with the whole Typescript idea, but don't really have the time to migrate it into the Typescript language. We do however want people to be able to use our library in the right way (for example, not passing in strings for numbers).

What we can do then is add a Typescript declaration file `index.d.ts` to the root of the `adder` module folder, which describes the 'shape' of our API

```ts
export function add(a: number, b: number): number;
```

Now when we try to compile, we get our error back

```
tsc
src/my-script.ts:3:32 - error TS2345: Argument of type '"7"' is not assignable to parameter of type 'number'.

3 console.log('Is it 10:', add(3,'7'), "?");
                                 ~~~
```

Let's fix the error by using the API the right way in `my-script.ts`

```ts
import { add } from '../adder';

console.log('Is it 10:', add(3,7), "?");
```

Now we can compile and run the compiled javascript

```
tsc & node dist/my-script.js
Is it 10: 10 ?
```

and observe once again what gets produced in `/dist/my-script.js`

```js
"use strict";
exports.__esModule = true;
var adder_1 = require("../adder");
console.log('Is it 10:', adder_1.add(3, 7), "?");
```

Now it's time for my assistant to come on stage and remove the curtain. Nothing up my sleeve. Delete the file `adder/index.js`...that's right, delete it. But leave the declaration `index.d.ts`. Now compile

```
tsc
```

It compiles with just the type declaration? Again, it produces the same result

```js
"use strict";
exports.__esModule = true;
var adder_1 = require("../adder");
console.log('Is it 10:', adder_1.add(3, 7), "?");
```

but of course won't run because we've gutted the actual module

```
node dist/my-script.js

module.js:538
    throw err;
    ^

Error: Cannot find module '../adder'
...
```

The type declaration is a special file that can travel along with the module, or it can be installed separately (I'll get to that mechanism in a bit). The syntax in the type declaration file is a special syntax unique to Typescript, and describes the shape of the API: the types of inputs to functions, and their outputs, among other things.

### How Does Typescript Know Where to Find Declarations?

In our example, we created our own module called `adder` right in source. It can be called a 'user-defined' module, given away by how we used a path, `../adder` to reference it

```
import { add } from '../adder';
```

Most of the time, modules are installed through `npm install`. For example, we might do

```
npm install adder
```

`npm` stands for Node Package Manager, a tool that comes with NodeJS and is basically how modules are managed. `npm` looks for modules published to [npmjs.org](http://npmjs.org), and downloads them to your project into the `node_modules` folder. In this case, if we had published `adder` to npmjs.org, we would have the files

```
node_modules/adder
node_modules/adder/index.js
node_modules/adder/index.d.ts
node_modules/adder/package.json
```

placed into our project directory. To import the `adder` module, we would then do

```
import { add } from 'adder';
```

The Typescript compiler knows to look for the type declaration at `node_modules/adder/index.d.ts`, and NodeJS knows to look in `node_modules/adder` to resolve the `require`.

What if we don't even have time to describe the shape of our library and include an `index.d.ts`? No problem. The community has come up with a way to allow anyone to contribute a type declaration that describes the shape of a library, and this is where `@types` come in. The way this works is someone would publish a module to npm called `@types/adder`, and you would `npm install` it alongside `adder`

```
npm install adder @types/adder
```

To publish the type declaration for `adder`, that person would have to raise a PR (pull request) to the [Definitely Typed](https://github.com/DefinitelyTyped/DefinitelyTyped) repository on GitHub. After approval by that project's maintainers, it probably gets automatically deployed to npmjs.org under the `@types` organization.

After installing the `@types` and the module as above, you would roughly have the following folders and files

```
// actual module
node_modules/adder
node_modules/adder/index.js
node_modules/adder/package.json

// type declaration
node_modules/@types/adder
node_modules/@types/adder/index.d.ts
node_modules/@types/adder/package.json
```

The Typescript compiler also knows to check in `@types/adder` to find the type declaration there as well.

Read more about how this mechanism works [here](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types).

To see lots of examples of declaration files, go [here](http://www.typescriptlang.org/docs/handbook/declaration-files/templates.html)

## Conclusion

I hope you enjoyed this post, and it encourages you to make the leap into Typescript. I'm really excited by what I see happening with Typescript in the Javascript community. I've been using Typescript in the [atom-ide](https://ide.atom.io/) environment and enjoy seeing a lot of the behaviors I enjoy as a Java developer working in Eclipse now start to appear in my Javascript environment as well. Maybe an idea for an upcoming post?
