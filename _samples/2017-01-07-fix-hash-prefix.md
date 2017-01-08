---
layout: sample
title: Fixing Hash Prefix Error - Angular 1.6.0 + Yeoman
summary: Set $location.hashPrefix('') to fix url rewritting error
language: angular

tags:
  - angular
  - javascript
  - Yeoman
  - bug

# every code snippet is actually a Github gist
gist_tag: 04d0e4de00d16be05a7a1d2f61927b2e

published: true
permalink: /samples/fix-hash-prefix-yeoman-angular
---
When scaffolding a new site with the latest version of Yeoman (tested with 1.8.5), and selecting the default version of Angular (1.6.0 as of this writing), the urls are rewritten incorrectly by the ```$locationProvider```, resulting in urls like

```
http://localhost:9000/#!/#%2Fabout
```

when requesting a route like ```/#/about```. To fix this, just set the hashPrefix to the empty string as show in the app.js below:

{% gist page.gist_tag %}
