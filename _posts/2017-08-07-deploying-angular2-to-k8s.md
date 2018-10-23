---
layout: post
title:  "Deploying an Angular 2 App to Kubernetes"
date:   2017-08-07
tags: [ devops, jenkins, kubernetes, angular ]
intro: >
  In this post, I show how to deploy an Angular2 application built with the `ng` CLI tool
  into Kubernetes from a Jenkins pipeline job. I encountered a few minor hiccups along the way,
  and hopefully the pitfalls I discuss here will help you with your own projects.
published: true
---
{{page.intro}}

## Overview of the Deployment

For this demo, we'll use a sample diary application I have written. There are three deployable components for our sample app:

* `mydiary-angular` - an Angular 2 application bootstrapped by the Angular CLI tool
* `mydiary-rest` - the backend RESTful API written in Java using the Spring Framework.
* `mongodb` - the NoSQL database we'll use to store diaries and diary entries

This post will assume the REST service has already been deployed to Kubernetes, and is available at the cluster reachable service name `mydiary-rest` on port 8080. Here is a diagram showing how the components will fit together:

![mydiary architecture](/images/mydiary-architecture.png)

We'll understand this diagram as we go.

## Nginx Configuration

The REST service will expose resources `/diary`, `/diary/{id}/entry`, `/login`, and `/user`. Our Angular application will make API requests from the browser to `/api/*`, and Nginx will forward any url it receives beginning with `/api` to the backend service. Here are the lines in the nginx.conf file for performing this mapping using the `proxy_pass` directive

```
location /api {
  proxy_pass http://mydiary-rest:8080/;
}
```

So for example, if our nginx server is serving the site at ```http://kubernetes.example.com:30001```, a `GET` request to fetch all diaries for a user would go to the url

```
http://kubernetes.example.com:30001/api/diary
```

When Nginx receives the request, it would see the requested url starts with `/api`, and form a *new* request to

```
http://mydiary-rest:8080/diary
```

retrieve the response, and send it back to the browser. In this way, the browser never touches the REST service directly, but accesses it via Nginx proxy. This is a standard practice when deploying web applications that are internet facing, and avoids having to make what are called *Cross-Origin* requests.

Here is the complete `nginx.conf` file:

```
# Nginx Configuration for MyDiary
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    server {

      listen       80;
      server_name  localhost;

      location / {
          root   /usr/share/nginx/html;
          index  index.html index.htm;

          try_files $uri $uri/ /index.html;
      }

      location /api {
        proxy_pass http://mydiary-rest:8080/;
      }

    }

}
```

There are a few things to point out in this file. First, note our main `location` directive maps the url `/` to the directory `/usr/share/nginx/html` inside of the container. This is the default location inside of the official Nginx Docker image from which content is served. We could easily change this if we like, but there's no reason to for now so we leave it as is:

```
location / {
    root   /usr/share/nginx/html;
    index  index.html index.htm;

    try_files $uri $uri/ /index.html;
}
```

The `try_files` directive was necessary so that requests for *routed* urls that leave the browser somehow are redirected back to the `index.html`, and hence get handled by Angular. I'm still scratching my head on how this works exactly, but I found the tip [here](https://angular.io/guide/deployment#routed-apps-must-fallback-to-indexhtml) on Angular's official site.

## Building the Docker Image

When we build our Angular 2 site with `ng build --prod`, several things will happen

1. All Typescript files (ending in .ts) are linted and compiled into Javascript files.
2. The Javascript files are *uglified*, meaning that symbols are replaced with shorter compressed versions. So for example a function ```var myFunction = function() {...} would be replaced with var a = function() {...}. This cuts down the file size considerably, making response times faster.
3. All files are *minified*, meaning that extraneous whitespace (spaces, tabs, newlines) are removed. Again, this cuts down file size.
4. The Javascript code is condensed into a single vendor file to avoid makein unnecessary requests for multiple files.
5. The result is placed into the `/dist` folder in the project root.

All we need to do is copy the `/dist` folder to the default location for content in the Nginx image, and copy our `nginx.conf` file. Here is our Dockerfile which accomplishes this:

```
FROM nginx
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

## Deploying to Kubernetes from a Jenkins Pipeline

Now that we understand how our deployable will be built from source, our build pipeline will follow these steps:

1. `git pull` and checkout the latest commit
2. run `npm install` and `ng build --prod`
3. build and tag the Docker image `clf112358/mydiary-angular`
4. update the image version in the Kubernetes deployment to the latest build

Our Jenkinsfile for the complete deployment looks like this

```groovy
node {
  // hold short version of commit sha for this checkout
  def shortSha = ''

  stage('checkout') {
    def scm = git branch: 'master', url: 'ssh://git@gogs.home:10022/chase/mydiary-angular.git'
    shortSha = scm.GIT_COMMIT.take(8)
  }

  /*
   * builds the site using the prod target and environment
   * the minified site will be in the dist folder
   */
  stage('build dist') {
    nodejs('nodejs') { // adds the node environment to PATH
      sh 'npm install'
      sh 'ng build --prod'
    }
  }

  stage('build and push Docker image') {
    def image = docker.build 'clf112358/mydiary-angular'
    image.push "dev"
    image.push "dev-$shortSha"
  }

  // updates deployment with latest dev Docker image
  stage('deploy to dev') {
    withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
      sh "kubectl set image deploy mydiary-site-deploy mydiary-site=clf112358/mydiary-angular:dev-${shortSha} --record=true"
    }
  }
}
```

All we need to do after adding these files is simply tell Jenkins where our repo lives and it will create and run the pipeline for us. I've have covered how to do this in a previous [post](/devops/jenkins/2017/07/04/pipeline-as-code.html), but it is easy to do from the Blue Ocean UI if you haven't done it before.

## Conclusion

I hoped this post helped. If there are any comments or questions for me, please feel free to post in the comments section below.
