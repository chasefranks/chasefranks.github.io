---
layout: post
title:  "The Death of a Stack Frame, or How Methods Return"
date:   2017-11-02
tags: [ java, jvm ]
intro: >
 In a previous [post](/java/jvm/2017/10/27/the-birth-of-a-stackframe.html), we looked at how the JVM creates a new stack frame when it invokes a method. In this melodramatically named series, we will take a look at how methods return from the perspective of the JVM.
published: true
---
{{page.intro}}

# `ireturn=0xac`

Let's start with a trivial example in Java. Suppose we have a method that simply returns the integer 17:

```java
public class B {
  public int getInt() {		
    return 17;
  }
}
```

and a class `A` with a method that calls `getInt()`

```java
public class A {
  private B b;

  public A() {
    b = new B();
  }

  public void printInt() {
    int i = b.getInt(); // invoke getInt() method
    System.out.print(i);
  }
}
```

Let's see step-by-step how the JVM returns the 17 from the method `getInt()`.

Suppose the JVM is executing the method `printInt`. We know from our previous discussion that this means the JVM is executing the bytes that represent the opcodes of the `printInt` method, and that these opcodes are acting on the stack frame for the currently executing method.

![](/images/death-of-a-stack-frame/1.png)

Now the method call `b.getInt()` means that the `invokevirtual` instruction will be encountered. The `getInt` method will be resolved, and a new stack frame will be created:

![](/images/death-of-a-stack-frame/2.png)

Execution picks up from the first instruction in the `getInt` method. The stack and `pc` register at this point looks like:

![](/images/death-of-a-stack-frame/3.png)

The method that we are now executing is

```java
public int getInt() {		
	return 17;
}
```

which was compiled to the stream of bytes: `[Ox10, 0x11, 0xac]` by the java compiler.

The opcode [`0xac`](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-6.html#jvms-6.5.ireturn) which has the mnemonic `ireturn`, is the instruction responsible for returning from our method. The i stands for integer, and it gets interpreted as "return the integer from the top of the operand stack". It is the responsibility of the bytes preceding `0xac` to prepare the operand stack with the return value. In this case, the [`bipush`](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-6.html#jvms-6.5.bipush) opcode pushes the byte following it onto the operand stack

```
0x10 //bipush
0x11 //17
```

![](/images/death-of-a-stack-frame/4.png)

Now the `pc` is at the `ireturn` instruction. The JVM knows the return value is on the top of the operand stack of the current frame, so it pops the 17 from there and reaps the current frame, effectively ending the execution of the method `getInt`:

![](/images/death-of-a-stack-frame/5.png)

The 17 that was popped from the exited frame, is now pushed onto the operand stack of the frame for `printInt` which is reinstated as the current frame. The `pc` is set to resume execution at the opcode following the `invokevirtual` instruction:

![](/images/death-of-a-stack-frame/6.png)

In this case, it is the fulfillment of the left-hand side of

```java
int i = b.getInt();
```

which is a store instruction into the local_vars array at index 1, symbolically referenced by i.

# Conclusion and a Challenge

A method return is simply popping from the operand stack, pushing onto the operand stack of the previous frame, reinstating that frame as the current frame, and incrementing the `pc` to pick up from the point after method invocation. For every thread, frames are being pushed and popped from the thread stack, while the `pc` for that thread dances between sequences of JVM instructions. New threads are created and destroyed, but they all do the same dance in parallel. Ocassionally, the JVM has to stop executing byte code to clean up a section of memory called the **heap**. This clean up period is called a **garbage collection** sweep, and since bytecodes are not being executed then, it can affect performance.

Here's a challenge. How do I know that the examples above compile to what I told you? It turns out there is a tool that comes with the JDK called `javap`, which can dissassemble Java bytecode. Create the two .java files, A.java and B.java, and compile our example with

```
javac A.java B.java
```

Then use the `javap` command to see the bytecode

```
javap -c A.class
javap -c B.class
```

Does it match up?
