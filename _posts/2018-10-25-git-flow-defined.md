---
layout: post
title:  "What is Gitflow?"
date:   2018-10-25
tags: [ git, devops ]
intro: >
  Is your organization or team is asking questions about release strategy, or debating the best way to keep track of what features and bug fixes are going into each release? Then let me introduce you to *git flow*. Git flow is a strategy that tells you which branches to create for different purposes, how to create them, how and when to merge them, and how to release software in a way that makes it easy to see what features are going in to each release.
published: true
disqus_id: git-flow-defined
---
{{page.intro}}

## Git Flow Defined

Git flow was formulated by Vincent Driessen in his blog post [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/). This article is extremely well-written and gives complete guidance on how to follow the git flow model, even giving you examples of what to do on the command line. You have everything you need after reading this article to follow git flow, or propose it to your team.

So I would like to start a thread by simply re-blogging Driessen's original article. Give this a read, and then come back and let me know what your experience has been. As always feel free to bring up any questions you have in the Disqus board below.

## My Experience

Let me kick it off by relaying a little bit of my experience. I was informed of the existence of git flow by the scrum master on probably one of the most well-oiled teams I've worked on. This team adhered to git flow pretty closely. No one ever defined it for me or laid it out as clearly as the original article, so I ended up Googling for git flow (surreptitiously between user stories) while on the job. You guys know how it is!

But we used it, and after a while I saw what we were doing. What I took away from it was the rhythm of each sprint. A developer on a git flow team knows that there will be a `develop` branch and that's where they branch their work off of, and merge back to when they're done. To start on a new feature they just create a new branch like

```
git checkout -b feature/US12345-chat-widget
```

and get to work.

You may be asking about how I came up with that branch name `feature/US12345-chat-widget`. It's totally up to you, but most teams follow a convention. My answer is to do what others are doing, and if there's no convention, start one by following a consistent pattern yourself. Here are some other sane options for the branch naming

* `feature/chat-widget`
* `feature-chat-widget`

What about the US12345? That could be a JIRA ticket or Rally user story number. The team meets to groom user stories, developers break with some idea what they're working on, and then you see branches go up. I like putting the ticket number on my feature branches, and then pushing to origin to signal the team that I've started work.

This breaks a little from the advice in the section on [feature branches](https://nvie.com/posts/a-successful-git-branching-model/#feature-branches), that developer feature branches shouldn't be in origin, and instead developers should create remotes for each other's repos. Most developers will use the remote origin to collaborate with one another, or to help each other out to troubleshoot an issue. If someone tells me their local build is broken and they need help, the first thing I'm going to do is ask them to push their feature branch so I can pull it and recreate the issue. I probably wouldn't ask them to serve their local repo, mostly due to the security restrictions on most of the corporate networks I've been on. However, it is a perfectly natural thing to do with git being a distributed VCS. I wonder if any teams out there share their local repos this way, but I digress.

You *do* however want to make sure and clean up after yourself so you aren't leaving finished feature branches on `origin`. In this way, the feature branches that exist on `origin` should represent active work, and are short-lived. I usually do the following.

1. merge to develop and push to origin when I'm done

    ```
    git checkout develop
    git merge -no-ff feature/chat-widget
    git push
    ```

2. delete the remote feature branch

    ```
    git push -d feature/chat-widget
    git remote prune origin
    ```

3. prune the remote tracking branch to sync the deletion locally

    ```
    git remote prune origin
    ```

4. delete the local feature branch

    ```
    git branch -d feature/chat-widget
    ```

Lastly, I haven't found git flow to be used everywhere, and a lot of people don't even know about it. I was on a job once where the question of how to let the customer know *what* exactly was a part of each release. We created a `changelog.md`, but it was a pain to go back in time and detail what changes were actually along develop since the last release. I found the answer from the original article: it's that little `--no-ff` flag which causes git to create an actual commit in develop to mark when a feature has been merged. I wish I would've known about that then, and I'll definitely be avoiding fast-forward merges to develop in the future.

## Conclusion

Please feel welcome to keep the discussion going in the comments below, or just drop me some feedback on whether you use git flow on your team. I always learn a lot and usually realize I don't know as much as I thought I did when people ask me questions.
