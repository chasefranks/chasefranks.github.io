---
layout: post
title:  "Deploying GlusterFS in Kubernetes as a Dynamic Storage Provisioner - Part 3"
date:   2017-06-26
categories: kubernetes storage kvm
intro: >
 Part 3 of a three part blog series showing how to set up GlusterFS in Kubernetes and create a StorageClass to dynamically provision storage for Kubernetes pods. In this post, we finally get to create our StorageClass resource in Kubernetes and take it for a spin with an example MongoDB deployment.
published: false
---

## Creating the Storage Class

Finally, we can create the storage class we need. First, get the cluster ip address of the heketi service

```
kubectl get svc
NAME                       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
...
heketi                     10.109.14.91    <none>        8080/TCP         16h
```

So the Heketi API is available at 10.109.14.91:8080. Here is  what the Kubernetes resource definition for the GlusterFS storage class should look like

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: glusterfs
provisioner: kubernetes.io/glusterfs
parameters:
  resturl: "http://10.109.14.91:8080"
  restauthenabled: "false"
```

Save this to a file storageClass.yaml and create the storage class with

```
kubectl create -f storageClass.yaml
```

You should be able to see the storage class with

```
kubectl get storageclass
NAME        TYPE
glusterfs   kubernetes.io/glusterfs
```

## Our MongoDB deployment

Ok, let's test the storage class with a MongoDB Kubernetes deployment that will try to dynamically claim a 10 GB volume from our GlusterFS. Keep this central idea in mind since it motivates everything we've done so far

> I want to be able to drop this deployment in *any* cloud and have it work.

Let's explain this a little more. First, here is our deployment resource

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: mongo-deployment
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: glusterfs-test
    spec:
      containers:
      - name: mongo
        image: mongo:3
        ports:
        - containerPort: 27017
        volumeMounts:
          mountPath: /data/db
          name: data
      volumes:
        - name: data
          mountPath: /data/db

```
