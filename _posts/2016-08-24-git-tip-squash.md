---
layout: post
title:  "Git Tip - how to squash commits when merging"
date:   2016-08-24
categories: [git, tips, workflow]
tags: [tips, git]
intro: >
  Have you ever created a private local branch and made a bunch of ridiculous commits that show how much you still have to learn about the way gradle and the world works? Wouldn't it be great if you could merge your private branch back into ```master``` with a single commit, instead of showing all of your silly commits along the way? That's exactly what I'll show you how to do with the `--squash` option.
published: true
disquis_id: git-tip-squash
---
{{page.intro}}

Lets say I have the following scenario: I'm working on ```master```, which has nice clean, serious commits

![git master branch...nice and clean](/images/git-tip-squash-1.svg)

and an idea strikes my fancy. I create a local branch, knowing that the master branch will stay pristine while I experiment

```
git branch it-just-might-work
```

I make a commit in my new branch

![create new branch for experiment](/images/git-tip-squash-2.svg)

then realize I forgot to .gitignore something...

then realize I shouldn't have ignored that artifact...

Then...arrg!

Finally, writing a few lines of actual code shows the idea panned out, but my local tree has

![finally](/images/git-tip-squash-3.svg)

I checkout the master branch to merge in my code,

```bash
git merge it-just-might-work
```

but wait a minute...I don't want the master branch to show all of my mucking around, which is exactly what would happen if I did a plain merge.

The solution is to use the ```--squash``` option like so

```
git merge --squash it-just-might-work
```

This way, you would get a single new merge commit in ```master``` which makes it look like you knocked it out with one try.

![end result looks good](/images/git-tip-squash-4.svg)

I suggest you use this command after your next foray into madness and back again. A nice feature (I think) is that it doesn't actually auto merge, but just stages the changes and let's you make the merge commit when you're ready.
