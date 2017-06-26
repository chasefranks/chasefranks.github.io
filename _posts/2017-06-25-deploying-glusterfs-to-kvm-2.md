---
layout: post
title:  "Deploying GlusterFS in Kubernetes as a Dynamic Storage Provisioner - Part 2"
date:   2017-06-25
categories: kubernetes storage kvm
intro: >
 Part 2 of a three part blog series showing how to set up GlusterFS in Kubernetes and create a StorageClass to dynamically provision storage for Kubernetes pods. In this post, we'll really get into the deployment by hopefully having a working GlusterFS cluster deployed as a Kubernetes DaemonSet.
published: true
---
{{page.intro}}

## The GitHub Project

We first need to clone this GitHub project

```
git clone https://github.com/gluster/gluster-kubernetes.git
```

These guys have done a great job of providing the deployment we need to get going with GlusterFS on Kubernetes. We only need to add our Kubernetes worker nodes and the block devices we added in part 1 to a topology file. Then we run the provided script deploy/gk-deploy. There is a little setup needed, and a few packages we need to install on our Kubernetes nodes to get this to work right.

For another point of view, this blog [post](http://blog.lwolf.org/post/how-i-deployed-glusterfs-cluster-to-kubernetes/) has some good advice for what we're trying to do as well as solutions and workarounds to other pitfalls you may encounter.

## Patching our Kubernetes Nodes

First, log in to each node and install the ```glusterfs-client``` package

```
sudo apt-get install glusterfs-client
```

I also found that I needed to load the ```dm_thin_pool``` kernel module with

```
sudo modprobe dm_thin_pool
```

## Deploying GlusterFS

Ok, now on to deploying our GlusterFS cluster. First cd into the deploy folder of the gluster-kubernetes repo, and copy the topology.json.sample as topology.json. Edit it to look like your setup. For example, in my Kubernetes cluster, I have 1 master and 3 worker nodes:

* kube-master
* kube-node-1
* kube-node-2
* kube-node-3

On all three workers, the block storage we created and attached in the previous post is /dev/vdb. So our topology file looks like

```json
{
  "clusters": [
    {
      "nodes": [
        {
          "node": {
            "hostnames": {
              "manage": [
                "kube-node-1"
              ],
              "storage": [
                "192.168.1.2"
              ]
            },
            "zone": 1
          },
          "devices": [
            "/dev/vdb"
          ]
        },
        {
          "node": {
            "hostnames": {
              "manage": [
                "kube-node-2"
              ],
              "storage": [
                "192.168.1.3"
              ]
            },
            "zone": 1
          },
          "devices": [
            "/dev/vdb"
          ]
        },
        {
          "node": {
            "hostnames": {
              "manage": [
                "kube-node-3"
              ],
              "storage": [
                "192.168.1.5"
              ]
            },
            "zone": 1
          },
          "devices": [
            "/dev/vdb"
          ]
        }
      ]
    }
  ]
}
```

This json schema in this topology file actually comes from [Heketi](https://github.com/heketi/heketi), a REST API for managing GlusterFS that we will install as part of this deployment.

Now, here's the important part which caused me some consternation until I read the docs for this GitHub project more closely. You have to run the gk-deploy script *from* the master node. The Heketi REST service is temporarily exposed to initialize the GlusterFS pods during deployment, but is not a NodePort service so is not externally accessible. Anyway, no problem

```
scp -r deploy kube-master:~ && \
  ssh kube-master
```

and we'll work from there from now on.

One more thing...we need the ```heketi-cli``` client available on the ```PATH``` when we run the script

```
wget https://github.com/heketi/heketi/releases/download/v4.0.0/heketi-client-v4.0.0.linux.amd64.tar.gz -C $HOME && \
  tar xvzf heketi-client*.tar.gz && \
  export PATH=$PATH:$HOME/heketi-client/bin
```

After this, you should have ```heketi-cli``` available to you in your shell.

Now we just run the provided script passing the -g option to create the GlusterFS daemonset.

```
./gk-deploy -g
```

Hopefully this runs all the way through for you. If it doesn't, consult the blog post I listed above to see if your problem is mentioned.

## Testing GlusterFS

These are the pods Kubernetes should be running after successful deployment

```
kubectl get pods
NAME                                  READY     STATUS    RESTARTS   AGE
glusterfs-9kx9q                       1/1       Running   0          13h
glusterfs-dr70f                       1/1       Running   0          13h
glusterfs-s54sr                       1/1       Running   0          13h
heketi-1125625054-x7956               1/1       Running   0          11h
```

Also, here are what the services and endpoints should look like

```
kubectl get svc
NAME                       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
heketi                     10.109.14.91    <none>        8080/TCP         11h
heketi-storage-endpoints   10.99.135.221   <none>        1/TCP            11h

kubectl get ep
NAME                       ENDPOINTS                                      AGE
heketi                     10.39.0.2:8080                                 11h
heketi-storage-endpoints   192.168.1.2:1,192.168.1.3:1,192.168.1.5:1      11h
```

Since we installed ```heketi-cli```, we can get cluster details with

```
heketi-cli cluster list
Clusters:
0f3dd92018dd2c843ecfca58cb9c0482
```

```
heketi-cli cluster info 0f3dd92018dd2c843ecfca58cb9c0482
Cluster id: 0f3dd92018dd2c843ecfca58cb9c0482
Nodes:
0bb96ae89fbb6f55b7c702c56bbc2d32
2609c78064af4f5a0a3a15de690e2dbf
a1bc3b5015c6a7c56c32171eeb50819c
Volumes:
9748eab3f1bc3d558eb245e298284e78
```

Our Kubernetes ```StorageClass``` will use the Heketi service to dynamically provision volumes for pods, so we'll assume everything is good for now. Later on, I'll give a more detailed walk through of Heketi and GlusterFS, but I would like to actually get back to deploying apps and writing code, so let's move on to the next post where we create our StorageClass and use it to provision persistent storage for MongoDB.
