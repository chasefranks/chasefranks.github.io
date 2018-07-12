---
layout: post
title: How `@types` Work in Typescript
date:   2018-07-12
categories: javascript typescript
intro: >
 One of the things that's always been sort of a mystery to me is how `@types` work in Typescript. You encounter this when you are working in Typescript, but you want to bring in your favorite library like RxJS or lodash. Let's unravel the mystery.
permalink: how-type-declarations-work-in-typescript
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

Let's create a script called `my-script.ts` in the src folder:

```js
var add = function(a,b) {
    return a + b;
}

console.log('Is it 10:', add(3,7), "?")
```

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

We don't get build output in `dist` for this file, and this code never goes to production to wreak havoc. This is called compile-time type checking, because it happens at compile time.

## Modules

Ok, let's pretend that this `add` function is really valuable, and we want to share it with others. We need to create a module. Let's create a directory at the top level called `adder` and put our plain javascript version of add in a file called index.js there:

```
mkdir adder && touch index.js
```

```js

```
