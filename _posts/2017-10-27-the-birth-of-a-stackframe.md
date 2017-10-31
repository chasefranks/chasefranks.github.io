---
layout: post
title:  "The Birth of a Stack Frame, or How Methods Are Invoked"
date:   2017-10-27
categories: java jvm
intro: >
  In this post, we look at how the Java Virtual Machine (JVM) invokes a method by creating a stack frame.
published: true
---
{{page.intro}}

# Structure of a Stack Frame

A method in Java, is for all practical purposes, a stream of bytes, where each byte is an opcode from the JVM instruction [set](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-6.html), possibly followed by several byte operands. Let's say we are in a method that is currently executing

![](/images/birth-of-a-stack-frame/1.png)

In this diagram, the `pc` stands for the program counter which keeps track of the instruction currently being executed. Each byte is shown in hexadecimal form. The bytes 0x2a, 0xb4, and 0xb6, actually represent opcodes. You can look them up and see what they do. All the JVM does is loop over bytecode and execute each instruction. The key difference between the JVM and a real CPU is that a CPU executes instructions using physical electrical gates, whereas the JVM 'interpretes' each opcode and executes it in software. Hence the term 'virtual machine'.

The opcodes for a method act on an object called a *frame*. A frame is the execution context for the method, and it looks something like this

![](/images/birth-of-a-stack-frame/2.png)

The parts of the stack frame are as follows

* local_vars - an array holding the local variables for the method, i.e. any arguments passed to the method or variables declared within the method.
* operand_stack - a last in first out (LIFO) data structure that is the working memory for the instructions of a method. The operand stack is like a CPU register that behaves like a stack.
* const_pool - a reference to the the *run-time constant pool* of the class that owns this method...more on this later

Here's a concrete example: Suppose we have some Java code inside of a method that looks like

```java
int a=7;
int b=9;

int i = a+b;
```

To execute this simple snippet of code, the JVM performs the following operations on the frame:

push 7 onto operand stack

![](/images/birth-of-a-stack-frame/3.png)

pop from operand_stack and store into the local_vars array at index 1.

![](/images/birth-of-a-stack-frame/4.png)

These two operations constitute the execution of the line

```java
int a = 7;
```

Similarly,

```java
int b = 9;
```

is executed as:

push 9 onto operand stack

![](/images/birth-of-a-stack-frame/5.png)

pop from operand_stack and store into the local_vars array at index 2

![](/images/birth-of-a-stack-frame/6.png)

It's clear now that the variable names a, b are irrelevant to the JVM. They are just two different local variables holding int values. That's all the JVM needs to know.

The execution of

```java
int i = a + b;
```

proceeds as follows:

load local_vars[1] onto operand_stack

![](/images/birth-of-a-stack-frame/7.png)

load local_vars[2] onto operand_stack

![](/images/birth-of-a-stack-frame/8.png)

call `iadd` instruction (this pops 7,9 from the operand_stack, adds them, and pushes the result back onto the stack)

![](/images/birth-of-a-stack-frame/9.png)

pop from operand stack and store into local_vars array at index 3 (symbolically referenced by i)

![](/images/birth-of-a-stack-frame/10.png)

To summarize, the steps are

```
push 7 onto operand_stack
store latest value from operand_stack into local_vars[1] (symbolically a)
push 9 onto the operand_stack
store the latest value from operand_stack into local_vars[2] (symbolically b)
load local_vars[1] onto operand_stack
load local_vars[2] onto operand_stack
iadd
store latest value from operand_stack into a local_vars[3] (symbolically i)
```

and believe it or not, the corresponding bytecode would look like

```
0x10
0x07
0x3c
0x10
0x09
0x3d
0x1b
0x1c
0x60
0x3e
```

The `pc` just moves down this list from byte to byte, and the JVM executes each instruction by performing the corresponding operation on the current stack frame. If you understand this simple example, you already know a lot about how the JVM does most of its work.

# `invokevirtual=0xb6`

To see how new methods are invoked, let's go back to our example and suppose the JVM is executing a method

![](/images/birth-of-a-stack-frame/1.png)

The opcode 0xb6 represents the `invokevirtual` instruction, which is responsible for invoking a method. The two bytes immediately following the opcode are used to build an index into the run-time constant pool table. This is how it works.

First, the operand stack of the stack frame corresponding to the current method is prepared with the object reference to call the method on and the arguments of the method:

![](/images/birth-of-a-stack-frame/11.png)

This the responsibility of all the bytes coming before 0xb6. In the diagram above, those bytes would have pushed `arg2`, `arg1`, and then `obj_ref` onto the operand stack, probably using `load` instructions.

Then the JVM encounters the `invokevirtual` opcode 0xb6. The two bytes following the opcode, 0x00 and 0x16, are *embedded* operands of the opcode that the JVM will use to lookup the method from the constant pool table. We call them embedded operands because they are arguments of the opcode embedded in the bytecode stream.

![](/images/birth-of-a-stack-frame/12.png)

It takes the bytes 0x00 and 0x16, concatenates them to get 0x0016 which in decimal is 22, and get the item at index 22 in the constant pool table:

![](/images/birth-of-a-stack-frame/13.png)

Now the item in the constant pool table that lives at row 22 will be a *symbolic reference* to a method. What does this mean? The symbolic reference is a data structure that is defined in the JVM spec, and references a method abstractly. When the class that contains our `current_method` was compiled, it didn't know what method would actually be invoked at run-time because there is no way it could know what the JVM would have on its class path. Method resolution is the process the JVM uses to find the *actual* method to invoke, which at the end of the day, means that there is a new stream of byte codes the JVM will hand control to:

![](/images/birth-of-a-stack-frame/14.png)

When the method is resolved, the JVM pushes a new frame for it on the stack, pops the obj_ref, arg1, and arg2 from the operand stack of the current frame, and sets those to local_vars[0], local_vars[1], and local_vars[2], in the new frame:

![](/images/birth-of-a-stack-frame/15.png)

This is how an invoked method receives its parameters and a reference to the object it is being invoked on (the `this` keyword in Java).

Finally, the program counter `pc` is set to point to the first instruction in the resolved method and begins execution from there:

![](/images/birth-of-a-stack-frame/16.png)

# Summary
The JVM starts your program by starting execution at the `main` method. From here different methods are invoked, and for each method a new stack frame is allocated. The `pc` just dances around different sequences of instructions represented as bytes, which perform operations on the current frame. If you can imagine all of this at work in your head, you are most of the way there to understanding most of what the JVM does.

That's it! I hoped you enjoyed this post. Stay tuned for my next post where we will discuss how methods return.

**Note: This post was written for [Toptal](http://www.toptal.com) to express my interest in joining the Software Developers Group**.
