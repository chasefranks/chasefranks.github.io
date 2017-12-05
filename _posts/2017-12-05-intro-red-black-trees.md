---
layout: post
title:  "Introduction to Red-Black Trees"
date:   2017/12/05
categories: algorithms trees
intro: >
  In this post, we introduce red-black trees. These are a class of binary search trees that are known as balanced trees, and are useful in a variety of applications, for example the `TreeMap` class in Java. We show how the height of a red black tree is bounded by the logarithm of the number of nodes, and demonstrate how to insert a new node into a red black tree.
published: false
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

The *height* of a BST is the number of nodes on a longest path, starting from the *root* node (in this case 5), and ending at a *leaf* (the nodes 4, 8, 10, and 13 in this case). This would be the worst number of comparisons that a failed search would involve, and you want this number to be as small as possible. In our tree, searching for say 11 would involve 4 comparisons so our height is 4.

## Balance

As the number of levels, or height (h) grows in a BST, the number of nodes (n) should be growing roughly exponentially as a function of height:

$$n \approx 2^h$$

Said in terms of logarithms, the height should be somewhere around the logarithm of the number of nodes

$$log_{2} (n) \approx h$$

Since the height is the running time of the worst case failed search, in a BST that is filling out correctly this number should be logarithmic in the number of nodes. If you think in terms of base 10 for a moment, 100 numbers would be fully searchable with at most 2 comparisons, 1000 numbers by 3, 1000000 by 6 etc. Increasing the number of nodes by a factor of 10 only adds 1 additional comparison. In our binary tree, the expectation is that doubling the number of nodes only adds 1 additional comparison. Pretty nice!

This is what is meant by a balanced tree, and it is the theoretical best way to arrange a BST so that searching takes the optimal number of comparisons. As an example of a tree that is not balanced, what if I gave you the list of numbers above in order:

```
3, 4, 5, 8, 9, 10, 12, 13
```

The tree would look like

![bst devolved to linked list](/images/bst-linked-list.png)

and this is nothing more than a linked list of numbers in order, which is slightly better than a raw indexed list when there are a large number of nodes.

The problem that a red black tree solves is that it allows a BST to grow in a flexible way, but preserves balance. Each node is colored either red or black, and collapsing the tree to the black nodes actually forms a perfectly balanced binary tree of a certain height. The red nodes represents how the tree can vary from a perfect balanced tree, but this freedom is bounded by the requirement that there are no adjacent red nodes.

# Red-Black Trees

A red black tree satisfies the following conditions:

* each node is colored red or black
* the root node is black
* there are no two adjacent red nodes
* the number of black nodes on any path from the root to a leaf is the same

## Operations on Red-Black Trees

### Recolor

### Left Rotation

### Right Rotation
