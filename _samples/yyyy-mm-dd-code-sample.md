---
layout: sample
title: An Example
summary: This sample shows how github gists can be embedded in Jekyll.
language: java

# categorize code snippet by tags (displayed but not functional yet)
tags:
  - Java
  - Test
  - Spring

# optional - if link to github repo put it here
github_repo: https://github.com/chasefranks/an_example

# every code snippet is actually a Github gist
gist_tag: 78a3073cb4c992de1866899cedb10798

published: false
permalink: /samples/java-example
---
Add more detail here or just show the gist

{% gist page.gist_tag %}
