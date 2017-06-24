---
layout: post
title:  "Deploying GlusterFS in Kubernetes as a Dynamic Storage Provisioner - Part 1"
date:   2017-06-24
categories: kubernetes storage kvm
intro: >
 A three part blog series showing how to set up GlusterFS in Kubernetes and create a StorageClass to dynamically provision storage for Kubernetes pods.
published: true
---
{{page.intro}}

## Storage Layout On My KVM Server

It's been a while since I looked at this beast, and I want to do some stuff with GlusterFS today. In fact, my goal is

> set up a dynamic storage provisioner in Kubernetes using the GlusterFS storage class

I've been using Kubernetes for dev deployments, and have run up against the limitations of ephemeral storage in containers (e.g. MongoDB needs persistent storage at the end of the day). The ```emptyDir``` volume in Kubernetes works for only the most trivial purposes, and disappears as soon as a pod is rescheduled onto a different Kubernetes node. ```hostPath``` is no better, since it is backed by a directory on one of the nodes.

This will probably be a three part series, so stay tuned. For today, my goal is to remember how I carved up my physical disks into logical volume groups (LVGs). It's probably a mess, but my goal is to create a logical volume of about 300 GB and attach this to a KVM storage pool. This storage pool will be used to allocate three disks (about 100 GB each), which will ultimately be the GlusterFS bricks.

### Physical Storage
So let's see what's going on starting with a shell right on the KVM hypervisor host. I like the lsblk command to get an overview of what block devices are available

```
lsblk
NAME                          MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda                             8:0    0 111.8G  0 disk
├─sda1                          8:1    0  55.9G  0 part /
├─sda2                          8:2    0  50.3G  0 part
│ └─vm--disks--fast-vm--disks 252:2    0  50.3G  0 lvm  /mnt/fast-vms
├─sda3                          8:3    0     1K  0 part
└─sda5                          8:5    0   5.6G  0 part [SWAP]
sdb                             8:16   0   1.8T  0 disk
├─vm--disks--hybrid-git--repo 252:0    0   100G  0 lvm  
└─vm--disks--hybrid-vm--disks 252:1    0   200G  0 lvm  /mnt/hybrid-vms
sr0                            11:0    1  1024M  0 rom
```

To see partition information,

```
fdisk -l
Disk /dev/sdb: 1.8 TiB, 2000398934016 bytes, 3907029168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes


Disk /dev/sda: 111.8 GiB, 120034123776 bytes, 234441648 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x00090e3f

Device     Boot     Start       End   Sectors  Size Id Type
/dev/sda1  *         2048 117186559 117184512 55.9G 83 Linux
/dev/sda2       117186560 222654463 105467904 50.3G 8e Linux LVM
/dev/sda3       222656510 234440703  11784194  5.6G  5 Extended
/dev/sda5       222656512 234440703  11784192  5.6G 82 Linux swap / Solaris

Disk /dev/mapper/vm--disks--hybrid-git--repo: 100 GiB, 107374182400 bytes, 209715200 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes


Disk /dev/mapper/vm--disks--hybrid-vm--disks: 200 GiB, 214748364800 bytes, 419430400 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes


Disk /dev/mapper/vm--disks--fast-vm--disks: 50.3 GiB, 53997469696 bytes, 105463808 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```

### Logical Volumes/Groups

Here are the volume groups

```
vgdisplay
  --- Volume group ---
  VG Name               vm-disks-hybrid
  System ID             
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  3
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                2
  Open LV               2
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               1.82 TiB
  PE Size               4.00 MiB
  Total PE              476932
  Alloc PE / Size       76800 / 300.00 GiB
  Free  PE / Size       400132 / 1.53 TiB
  VG UUID               zVEpeH-LQGu-qeCX-PlRT-0mCW-jXJC-nLqxxM

  --- Volume group ---
  VG Name               vm-disks-fast
  System ID             
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  3
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                1
  Open LV               1
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               50.29 GiB
  PE Size               4.00 MiB
  Total PE              12874
  Alloc PE / Size       12874 / 50.29 GiB
  Free  PE / Size       0 / 0   
  VG UUID               mJh0VL-k23Y-eRNG-Wusl-r2zi-tCqg-XjOVZs
```

and here are the logical volumes

```
lvdisplay
  --- Logical volume ---
  LV Path                /dev/vm-disks-hybrid/git-repo
  LV Name                git-repo
  VG Name                vm-disks-hybrid
  LV UUID                Sf08gJ-ynnv-SB2g-OHNh-8Jfo-QhdP-y62SIL
  LV Write Access        read/write
  LV Creation host, time kvm-host, 2015-12-05 12:27:14 -0600
  LV Status              available
  # open                 1
  LV Size                100.00 GiB
  Current LE             25600
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           252:0

  --- Logical volume ---
  LV Path                /dev/vm-disks-hybrid/vm-disks
  LV Name                vm-disks
  VG Name                vm-disks-hybrid
  LV UUID                G8fXNa-AqI8-okx5-EqEH-ULHd-Csnz-Gv1Khk
  LV Write Access        read/write
  LV Creation host, time kvm-host, 2015-12-13 12:13:37 -0600
  LV Status              available
  # open                 1
  LV Size                200.00 GiB
  Current LE             51200
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           252:1

  --- Logical volume ---
  LV Path                /dev/vm-disks-fast/vm-disks
  LV Name                vm-disks
  VG Name                vm-disks-fast
  LV UUID                MqwcyW-Xr0l-sXMp-xxAJ-pf81-WNfI-sMfa34
  LV Write Access        read/write
  LV Creation host, time kvm-host, 2015-11-29 02:23:00 -0600
  LV Status              available
  # open                 1
  LV Size                50.29 GiB
  Current LE             12874
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           252:2

```

For this report, we may also want to get a current picture of what's mounted

```
# only relevant lines shown

mount

/dev/sda1 on / type ext4 (rw,relatime,errors=remount-ro,data=ordered)

/dev/mapper/vm--disks--fast-vm--disks on /mnt/fast-vms type ext4 (rw,relatime,data=ordered)

/dev/mapper/vm--disks--hybrid-vm--disks on /mnt/hybrid-vms type ext4 (rw,relatime,data=ordered)
```

as well as the file ```/etc/fstab``` which specifies how to mount block devices into the file tree at start up

```
# /etc/fstab: static file system information.
#
# Use 'blkid' to print the universally unique identifier for a
# device; this may be used with UUID= as a more robust way to name devices
# that works even if disks are added and removed. See fstab(5).
#
# <file system> <mount point>   <type>  <options>       <dump>  <pass>
# / was on /dev/sda1 during installation
UUID=3fbeb2a1-fe62-4aba-9a31-3eeef2e3c29f /               ext4    errors=remount-ro 0       1
# swap was on /dev/sda5 during installation
UUID=c50fc927-2b12-4fa6-9f23-1ff152c26cb7 none            swap    sw              0       0
# mount ssd storage of kvm guest images
/dev/vm-disks-fast/vm-disks 	/mnt/fast-vms 	ext4 	defaults 	0 	2
# mount for sshd storage of kvm guest images
/dev/vm-disks-hybrid/vm-disks 	/mnt/hybrid-vms ext4 	defaults 	0 	2
# mount for network share with iso images
//wdmycloud/isos 		/mnt/isos/ 	cifs 	defaults 	0 	2
```

### Creating a New Logical Volume

We can see from the above that we have plenty of room (1.5 TB) in the volume group vm-disks-hybrid, so let's create a 300 GB logical volume which will back our KVM storage pool:

```
sudo lvcreate -n glusterfs --size 300G vm-disks-hybrid
```

Then we format it as type ext3

```
sudo mkfs -t ext3 /dev/vm-disks-hybrid/glusterfs
```

## Creating the new Storage Pool in KVM

Now we create the storage pool in KVM using ```virsh```

```
virsh pool-define glusterFSStoragePool.xml
```

where our pool definition in glusterFSStoragePool.xml looks like

```xml
<pool type="fs">
  <name>glusterFSStoragePool</name>
  <source>
    <device path="/dev/vm-disks-hybrid/glusterfs"/>
  </source>
  <target>
    <path>/mnt/glusterfs</path>
  </target>
</pool>
```

Start it with

```
virsh pool-start glusterFSStoragePool
```

and mark it to autostart with

```
virsh pool-autostart glusterFSStoragePool
```

Listing all storage pools should show this for the glusterFS pool:

```
virsh # pool-list
 Name                 State      Autostart
-------------------------------------------
 chase                active     yes       
 default              active     yes       
 glusterFSStoragePool active     yes       
 hybrid-vms           active     yes       
 isos                 active     yes   
```

Using the storage pool, we can provision three 100GB disks and mount those into our three Kubernetes worker nodes. Let's first create the KVM volumes

```
virsh vol-create-as glusterFSStoragePool gluster1 100G --format qcow2
virsh vol-create-as glusterFSStoragePool gluster2 100G --format qcow2
virsh vol-create-as glusterFSStoragePool gluster3 100G --format qcow2
```

and verify they have been created in our mounted directory

```
ls /mnt/glusterfs/
gluster1  gluster2  gluster3
```

You should also be able to see them in virsh using the ```vol-list``` command

```
virsh # vol-list glusterFSStoragePool
 Name                 Path                                    
------------------------------------------------------------------------------
 gluster1             /mnt/glusterfs/gluster1                 
 gluster2             /mnt/glusterfs/gluster2                 
 gluster3             /mnt/glusterfs/gluster3  
```

Ok, now I just want to mention at this stage that I find the documentation for KVM/libvirt lacking in many ways, and this is a great example. I can set up a storage pool, check. I can allocate volumes from the pool, check. Now logically you want to know how to attach volumes to your VMs so you can actually use them. No where is this detailed, nor why using volumes/storage pools is better than simply creating a qcow2 directly on disk and using this.

What I think is that you can now just use the qcow files /mnt/glusterfs/gluster[1-3] we've created directly, and add them as libvirt ```device```s. So we'll go that route, and for that I'll use the VirtualManager console.

## Attaching the Disks to the Kubernetes Nodes

I have three Kubernetes worker nodes and one master, all running on top of KVM virtual machines. We want to add the volumes we've created to each worker node so it shows up as a 100GB block device.

From VirtualManager, I double click on one of the workers to get the info panel

![kvm info panel for vm](/images/kvm-add-volume/1.png)

I click on ***Add Hardware*** and choose ***Select or create custom storage***

![kvm add hardware](/images/kvm-add-volume/2.png)

I click ***Manage*** and choose one of the volumes, in this case, gluster3 from my storage pool

![kvm choose volume](/images/kvm-add-volume/3.png)

Click ***Choose Volume***, then ***Finish***

![kvm choose volume](/images/kvm-add-volume/3.png)

## Conclusion

Each one of my Kubernetes worker nodes should now have a 100 GB block device

```
lsblk
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sr0     11:0    1 1024M  0 rom  
vda    253:0    0   15G  0 disk
├─vda1 253:1    0   11G  0 part /
├─vda2 253:2    0    1K  0 part
└─vda5 253:5    0    4G  0 part [SWAP]
vdb    253:16   0  100G  0 disk
```

You can see the 100 GB device available at ```/dev/vdb```. We're set for the next part which is deploying GlusterFS into our Kubernetes cluster as a DaemonSet utilizing each disk we've created for GlusterFS storage.
