---
layout: post
title:  "Introduction to Red-Black Trees"
date:   2017/12/05
categories: algorithms trees
intro: >
  In this post, we introduce red-black trees. These are a class of binary search trees that are known as balanced trees, and are useful in a variety of applications, for example the `TreeMap` class in Java. We show how the height of a red black tree is bounded by the logarithm of the number of nodes, and demonstrate how to insert a new node into a red black tree.
published: true
---
{{page.intro}}

# Binary Search Trees

Let's start by talking about the problem that red black trees solve. Suppose I give you a list of numbers like

```
5, 9, 3, 12, 13, 4, 8, 10
```

Starting with 5, we can place each number in the list into a tree structure in the following way, placing each new number to the left or right in the tree by comparing it to each node:

![binary search tree](/images/bst.png)

This type of tree is called a *binary search tree* or BST for short, and it has a number of nice properties. For example, what if I wanted to search for 1 in the above list? If we just had the list, we would have to check each number in the list

```
list = {5, 9, 3, 12, 13, 4, 8, 10}
for ( i in list ) {
  if i == 1 { return true }
}
```

With the BST, we can decide that 1 is not in the list much quicker by navigating through the tree left or right by comparing 1 to the current node:

![bst search](/images/bst-search.png)

This only involves 2 comparisons before deciding that 1 is not in the list, much better than checking the entire list which would involve 8 comparisons. Since there is no structure, you have to check every number.

The *height* (h) of a BST is the number of edges on a longest path, starting from the *root* node (in this case 5), and ending at a *leaf* (the nodes 4, 8, 10, and 13 in this case). In the BST above, the height is 3.

The height is directly related to the largest number of comparisons that a failed search would involve, and you want this number to be as small as possible. In fact the worst case failed search involves h+1 comparisons.

## Balance

As the number of levels, or height (h) grows in a BST, the number of nodes (n) should be growing roughly exponentially as a function of height:

$$n \approx 2^h$$

The exact relation of nodes to height in a perfect binary tree is

$$ n = 2^{h+1} - 1 $$

using a geometric series in base 2, but let's stick with our wavy equals sign for now.

Said in terms of logarithms, the height should be somewhere around the logarithm of the number of nodes

$$log_{2} (n) \approx h$$

Since the height is the running time of the worst case failed search, in a BST that taking advantage of every new level being added as it grows, this number should be logarithmic in the number of nodes n. If you think in terms of base 10 for a moment, 100 numbers would be fully searchable with at most 2 comparisons, 1000 numbers by 3, 1000000 by 6 etc. Increasing the number of nodes by a factor of 10 only adds 1 additional comparison. In our binary tree, the expectation is that doubling the number of nodes only adds 1 additional comparison. Pretty nice...if the tree is growing in this way. The condition we're after can be expressed by the condition

$$ h \leq C \cdot log_{2} (n) $$

for some constant C, and this is what is meant by a *balanced* tree. It is the theoretical best way to arrange a BST so that searching takes the optimal number of comparisons.

As an example of a tree that is not balanced, what if I gave you the list of numbers above in order:

```
3, 4, 5, 8, 9, 10, 12, 13
```

The tree would look like

![bst devolved to linked list](/images/bst-linked-list.png)

and this is nothing more than a linked list of numbers in order, which is slightly better than a raw list when there are a large number of nodes. The worst thing you can do to form a BST which captures the ordering of a list of numbers is to pass the numbers in order!

The problem that a red black tree solves is that it allows a BST to grow in a flexible way, but preserves balance. Each node is colored either red or black, and collapsing the tree to the black nodes actually forms a perfectly balanced binary tree of a certain height. The red nodes represents how the tree can vary from a perfect balanced tree, but this freedom is bounded by the requirement that there are no adjacent red nodes.

# Red-Black Trees

A red black tree satisfies the following conditions:

1. each node is colored red or black
2. the root node is black
3. there are no two adjacent red nodes
4. the number of black nodes on any path from the root to a leaf is the same

## Operations on Red-Black Trees

Suppose we already have a red-black tree, and want to insert a new node. The algorithm for inserting new nodes into red black trees looks something like this.

* Insert the new node in the binary search tree as usual, using comparisons to navigate left/right until a null node is encountered.
* Color the new node red. This can only break rule 3 above since adding a red node does nothing to the count of black nodes on any path.
* If the parent of the new node is black, we do not break rule 3 so we are done.
* Otherwise, use recoloring and rotations on the tree until the red-black rules are satisfied.

Here we describe the operations we can perform. The rotation operations apply to any BST, and preserve the binary property of the tree. The combinations of operations needed turn out to be a easy to describe. For the ultimate reference, view the source of the `java.util.TreeMap` class, namely the method `fixAfterInsertion()`.

### Recolor

Recoloring is the easiest operation to perform. Let's say we add a new red node, and it has a red parent `p` (otherwise, we would be done by the algorithm above). Because of the red black property 3, `p`'s parent `g` is necessarily black

![red-black tree recolor](/images/new-node-recolor.png)

If the new node has a red uncle `u`, we can simply swap the colors on `g`, `p`, and `u`

![red-black tree recolor](/images/red-black-tree-recolor.png)

Now we've fixed the tree to not have adjacent red nodes, and have preserved the count of black nodes along any path coming into the subtree below `g`. We have however, introduced a red node with `g`, but we simply recurse upwards in the tree and perform the same operations as if `g` were a new node.

### Right Rotation

The left and right rotations apply to all binary search trees in general, so we do not show the red black coloring. A right rotation looks like this:

![bst right rotation](/images/bst-right-rotation.png)

Here we have a node `p` and its left child `l`. `l` is rotated up to the parent while `p` becomes its right child. The triangles denote the entire left or right subtree below the node.

It is easy to see that the rotation operation preserves the comparison relations in the tree

$$A < l \\ l < B < p \\ p < C$$

The key thing to note is that a rotation is a local operation at the node `p`. This means it only affects `p` and the nodes below `p`. The rest of the nodes of the tree are left unchanged, and because the ordering is preserved you still have a binary search tree.

### Left Rotation

A left rotation is the inverse of a right rotation, and looks like this:

![bst left rotation](/images/bst-left-rotation.png)

I leave it to the reader to verify the relations are preserved.

## Insertion

Now that we know how to operate on red black trees, we can outline how to fix our tree after inserting a new red node.

Let's say we've inserted our new red node `n`, which has a red parent `p`. The `p`'s parent `g` is necessarily black and not null (the only node in a tree with a null parent is the root node). Here's what we have so far

![](/images/rb-tree-insert-1.png)

The notation *l/r* means the node could be a right or left child of its parent. If `p`'s uncle, `u`, is red, we perform the recolor operation described above, so we assume that `u` is black.

![](/images/rb-tree-insert-2.png)

This gives us 4 cases two consider, depending on whether `p` lies left or right of `g`, and `n` lies left or right of its parent `p`. Now suppose `p` breaks to the right of `g`. We will only describe this case since the other can be handled through symmetry.

Suppose we are in this case

![](/images/rb-tree-insert-3.png)

The first step is a right rotation at p, which produces

![](/images/rb-tree-insert-4.png)

Then we swap colors on `g` and `n` to satisfy red-black property 3.

![](/images/rb-tree-insert-5.png)

Note this reduces the black node count by 1 for all paths going through g and breaking left, but preserves the black count for paths headed right.

Also, this puts a red node `g` at the top of our sub-tree, we may have to check `g` and its parent and recurse up the tree. We can solve both of these issues with a left rotation at `g`

![](/images/rb-tree-insert-6.png)

This handles this case in constant time, since there is no additional checking that needs to occur.

What if the new node `n` breaks to the right of `p`

![](/images/rb-tree-insert-7.png)

We arrived at this point after the first rotation described above, so we handle this case similarly. We can simply recolor and left rotate at `g`.

If `p` breaks to the left of its parent `g`, we perform the same operations with left and right swapped.

## Challenges

1. Draw out the two sub-cases like we have done above.

2. Get the source code for the `TreeMap.java` Java class. If you are working in an IDE like Eclipse, type `Ctrl+Shift+T` (or `Command+Shift+T` on a Mac) and type `TreeMap`. Then read the method `fixAfterInsertion(Entry<K,V> x)`. Can you see the left-right symmetry that allows us to skip over the second case reflected in the `if-else` statements in this method?

3. How do you get the maximum and minimum entries in a BST?

4. If you have a node in a BST, how do you get its successor? Hint: break it down into two cases, depending on whether a node was added before or after its successor in the tree.

5. Describe in detail how a `TreeMap` object returns its entries in sorted order?

## Summary

I hope you enjoyed this post, and now have a better feeling for how Red-Black trees work behind the scenes for sorted data structures like `TreeMap`. Without the red-black coloring, the irony is that the worst thing you could do to form a sorted data structure is add the elements in order!

## References

* [Robert Sedwick, Left-leaning Red Black Trees](https://www.cs.princeton.edu/~rs/talks/LLRB/LLRB.pdf)
  The introduction has a great discussion of rotations and recoloring.
