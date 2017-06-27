---
layout: post
title:  "Deploying GlusterFS in Kubernetes as a Dynamic Storage Provisioner - Part 3"
date:   2017-06-26
categories: kubernetes storage kvm
intro: >
 Part 3 of a three part blog series showing how to set up GlusterFS in Kubernetes and create a StorageClass to dynamically provision storage for Kubernetes pods. In this post, we finally get to create our StorageClass resource in Kubernetes and take it for a spin with an example MongoDB deployment.
published: true
---

## Creating the Storage Class

Finally, we can create the storage class we need. First, get the cluster ip address of the heketi service

```bash
kubectl get svc
NAME                       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
heketi                     10.109.14.91    <none>        8080/TCP         16h
```

so the Heketi API is available at ```http://10.109.14.91:8080```. Here is  what the Kubernetes resource definition for the GlusterFS storage class should then look like

```yml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: glusterfs
provisioner: kubernetes.io/glusterfs
  parameters:
    resturl: "http://10.109.14.91:8080"
    restauthenabled: false
```

Save this to a file *storageClass.yaml* and run

```bash
kubectl create -f storageClass.yaml
```

You should be able to see the storage class with

```bash
kubectl get storageclass
NAME        TYPE
glusterfs   kubernetes.io/glusterfs
```

## Our MongoDB deployment

Ok, let's test the storage class by trying to claim a 10GB persistent volume for a MongoDB deployment in Kubernetes. Now I may be asking for storage that may or may not be there. I don't to have to worry about that. Keep this central idea in mind since it motivates everything we've done so far

> I want to be able to drop this deployment in *any* cloud and have it work.

Let's explain this a little more. Here is our full deployment with the 10 GB volume claim.

```yml
---
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
          - name: data
            mountPath: /data/db
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: mongo-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-pvc
  annotations:
    volume.beta.kubernetes.io/storage-class: glusterfs
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

It may help to work from the bottom up and understand the PersistentVolumeClaim first. Yaml documents can be separated with three hyphens ```---```, so we are requesting two resources to be defined in Kubernetes: a ```Deployment``` and a ```PersistentVolumeClaim```.

The PersistentVolumeClaim we are defining is asking the infrastructure (i.e. our Kubernetes cluster) to find us a persistent volume that has at least 10 GB of storage and satisfies the access mode. If a persistent volume exists which satisfies the requirement of size (so has 10GB capacity or larger) and access mode (ReadWriteOnce means the volume can only be mounted by a single node), then it is claimed by our, well, claim, and the claim is said to be bound. The claim is given a name like all Kubernetes resources. In this case we called it ```mongo-pvc```.

To understand how to use the claim, it helps me to think of it as a check worth 10 GB. Even though it's not certain if the check will clear (that's the job of the storage class we just created), we can deposit the check and go forward with our lives assuming the money will be there. In the same way, we can use the claim as a volume, even though we don't know how it will be provisioned. This is what we're doing in this snippet from the ```Deployment``` definition


```yml
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: mongo-pvc
```

If we're not supposed to worry about how the storage is provisioned, you might ask about the ```annotations``` key. It looks pretty specific

```yml
volume.beta.kubernetes.io/storage-class: glusterfs
```

But keep in mind, anything called an annotation in code is usually a decorator and suggests you should try to ignore it for a second to see the larger structure. That's the suggestion here. It is possible to mark a storage class as the default to be used when there is no suggested provisioner, so we could've left off the annotation and let the cloud decide how to provision our storage.

Lastly, we just mount the volume into our mongo container

```yml
volumeMounts:
  - name: data
    mountPath: /data/db
```


the mount path being the location where the mongo container will keep it's data files, as described on it's DockerHub [page](https://hub.docker.com/_/mongo/).

Let's deploy it. Save it to a file called *mongo.yaml* and run

```bash
kubectl create -f mongo.yaml
```

Check the mongo pod is up and running

```bash
kubectl get pods
NAME                                  READY     STATUS    RESTARTS   AGE
glusterfs-9kx9q                       1/1       Running   0          2d
glusterfs-dr70f                       1/1       Running   0          2d
glusterfs-s54sr                       1/1       Running   0          2d
heketi-1125625054-x7956               1/1       Running   0          2d
mongo-deployment-2571363687-9616h     1/1       Running   0          3h
```

Let's see the claim with

```bash
kubectl get pvc
NAME        STATUS    VOLUME                                     CAPACITY   ACCESSMODES   STORAGECLASS   AGE
mongo-pvc   Bound     pvc-27089001-5ac6-11e7-bab8-5254000d7e44   10Gi       RWO           glusterfs      3h
```

Notice that the claim is bound to the volume ```pvc-27089001-5ac6-11e7-bab8-5254000d7e44``` that was created by our storage class. We can see the volume created with

```bash
kubectl get pv
NAME                                       CAPACITY   ACCESSMODES   RECLAIMPOLICY   STATUS    CLAIM               STORAGECLASS   REASON    AGE
pvc-27089001-5ac6-11e7-bab8-5254000d7e44   10Gi       RWO           Delete          Bound     default/mongo-pvc   glusterfs                3h
```

Lastly, we can see the backing volumes created in glusterfs through the Heketi API. Here are the volumes in glusterfs so far

```bash
heketi-client/bin/heketi-cli -s http://10.109.14.91:8080 volume list
Id:9748eab3f1bc3d558eb245e298284e78    Cluster:0f3dd92018dd2c843ecfca58cb9c0482    Name:heketidbstorage
Id:b188a621f7c9dbcb663b595c28026669    Cluster:0f3dd92018dd2c843ecfca58cb9c0482 Name:vol_b188a621f7c9dbcb663b595c28026669
Id:f50389c220f6d964666d1fa8f4207a0c    Cluster:0f3dd92018dd2c843ecfca58cb9c0482    Name:vol_f50389c220f6d964666d1fa8f4207a0c
```

Through blind guessing, it looks that ```f50389c220f6d964666d1fa8f4207a0c``` is the 10 GB volume our storage class provisioned

```shell
heketi-client/bin/heketi-cli -s http://10.109.14.91:8080 volume info f50389c220f6d964666d1fa8f4207a0c
Name: vol_f50389c220f6d964666d1fa8f4207a0c
Size: 10
Volume Id: f50389c220f6d964666d1fa8f4207a0c
Cluster Id: 0f3dd92018dd2c843ecfca58cb9c0482
Mount: 192.168.1.17:vol_f50389c220f6d964666d1fa8f4207a0c
Mount Options: backup-volfile-servers=192.168.1.3,192.168.1.5
Durability Type: replicate
Distributed+Replica: 3
```
