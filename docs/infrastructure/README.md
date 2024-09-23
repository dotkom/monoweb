# Dotkom Container Service

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [Alternatives](#alternatives)
  - [Benefits with ECS](#benefits-with-ecs)
- [Components](#components)
  - [The ECS Control Plane](#the-ecs-control-plane)
  - [The Nodes](#the-nodes)
  - [The Network](#the-network)
- [Deployment](#deployment)
- [Glossary](#glossary)

## Overview

Dotkom maintains a number of applications. These applications are all containerized, making it very easy to deploy them
anywhere that supports Docker. Some of the applications have different requirements such as availability and
scalability. To make deployment simpler, Dotkom wants to have a single platform that can be used to deploy all of the
applications and configure networking for them easily. This will reduce the amount of time spent on deployment, make it
easier for teams to own their own infrastructure, and make it easier to centrally manage the applications.

Having all the applications run on a single shared platform will make it easier to extend the platform in the future to
support more advanced observability, monitoring, and logging. It also means that developers interested in working on the
infrastructure only need to understand the architecture of a single platform, instead of having to worry about multiple
ways of deploying applications like Dotkom does today.

The platform is built on AWS, and is fully-managed by Terraform. The goal of the platform is to provide a single control
plane that can be used to deploy any application, and to provide a single networking layer that can be used to
communicate across applications.

## Architecture

The container service architecture is a very standard AWS ECS on EC2 architecture. All application traffic is ran
through an Application Load Balancer (ALB) that routes traffic to various AWS Target Groups, each of which point to a
task on in an ECS cluster. The cluster is made up of EC2 instances launched from an ECS-optimized AMI. The AMI is built
with HashiCorp Packer, and is configured to run Docker, ECS-agent, and SSM-agent. The EC2 instances are started by an
Auto Scaling Group that is registered with ECS.

All the EC2 nodes are launched into a private subnet within a VPC, with the ALB acting as the public endpoint. Any
service that requires access to the internet will have the `0.0.0.0/0` CIDR block mapped to a NAT Instance, which will
give the service access to the internet. This is all very standard AWS VPC networking.

To reduce costs of the NAT translation, we will not be using AWS NAT Gateway or the NAT Instance-provided AMIs. Instead,
we will be using fck-nat on a Graviton-based EC2 instance which is a very cheap option. See
https://fck-nat.dev/v1.3.0/choosing_an_instance_size/ for information on the NAT instance.

### Alternatives

There have been a few alternatives considered but for various reasons we have decided to go with ECS on EC2. Some of the
options considered were:

- ECS on Fargate: This becomes very expensive very quickly, and because the applications that we run are not very
  resource-intensive we end up paying a lot of money on compute that we don't use at all. 0.25vCPU on Fargate might not
  sound like a lot, but it's probably enough to run 8 instances of Vengeful Vineyard. Because 0.25vCPU is the minimum
  quantity on Fargate, we will be wasting a lot of compute. Furthermore, we are going to be running each application in
  both staging and production, so paying the minimum of $10 per container becomes very expensive.

See https://fargate.org/ to get a grasp of how expensive Fargate is.

- AWS Lightsail: This is a singificantly cheaper option for a control plane similar to the one ECS provides. The problem
  is that the Terraform integration is quite bad, and the logs are straight up terrible. Lightsail log retention is very
  limited and is not configurable. Furthermore, we would like to export the logs to another upstream service like the
  ELK stack or LGTM stack, but that is simply not going to be possible if we use Lightsail. Additionally, we have been
  running versions of both Grades and Vengeful Vineyard on Lightsail for a while, and while it works, it's far from
  ideal. Given that we're investing time into building a fair platform for running containers, we will prefer options
  that are easier to integrate in and out of.

- AWS EKS: This is a managed Kubernetes service from AWS. While we have been considering Kubernetes for a while, the
  cost of running on EKS is very high to the point where it's likely not even an option. Running a single EKS cluster
  without any nodes will run you for over $90 per month just for the control plane. Adding the cost of compute on top
  of that makes it unreasonably expensive.

- On-prem Kubernetes: We have been thinking about running Kubernetes or another orchestrator on-premise with NTNU
  SkyHigh, but given the feedback that we've heard about sudden downtime makes it a less favorable option. It is also
  of Dotkom's interest to run on services that are used in the real world, and with a large amount of companies moving
  to public cloud, we also have interest in running on AWS.

- Docker Swarm/Docker Compose on EC2: This is a very simple option, and was the draft for the first version of this
  document. The idea was to run multiple containers on a single EC2 instance, and to use Docker Compose as the container
  orchestrator. The gateway would be managed through Traefik, resulting in a very simple setup. Drawbacks of this
  architecture is that it's harder to scale (though that's likely not an issue with our traffic), and it's harder to
  isolate resources. Furthermore, it's requires a lot of manual configuration and is quite error prone.

### Benefits with ECS

ECS is a pretty powerful interface and it's hard to believe that AWS provides the control plane for free. By running
with the proposed architecture, we get:

- An easy control plane for management and monitoring of the services (cpu, memory, network, availability, etc.)
- A private network that is isolated from the internet
- Customized log drivers (we plan to use Docker's awslogs driver)
- High availability if deployed in multiple AZs
- A single platform for all Dotkom applications
- Significantly cheaper infrastructure than what we use on Lightsail today

## Components

### The ECS Control Plane

The ECS control plane is a single AWS ECS cluster that is used to provision all of the services. The cluster is tied to
an AWS ASG that is used to scale the nodes required to run the services. The cluster is also tied to an AWS ALB that
routes traffic to the services.

We will require healthcheck endpoints for all services, making it possible for both AWS ECS and the ALB to know when a
service is healthy.

### The Nodes

Each node is a separate EC2 instance that is launched from a launch template using an AMI built with Packer. We will
base our AMI on the official ECS-Optimized Amazon Linux 2023 AMI, where we will install and configure the SSM-agent.
ECS-agent will register with the ECS cluster and pick up tasks from the cluster.

We configure SSM-agent so connection to the instances can be made through AWS Systems Manager Session Manager. This will
allow us to connect to the instances from the AWS console or CLI, and debug any potential problems that may arise on the
nodes themselves.

In the future, we might also be interested in running Prometheus on the nodes, but an observability stack is currently
not within the scope of this proposal.

The instance type planned is currently `t3.small` which has a burstable CPU capacity of 2 vCPU. We believe that using a
burstable CPU type can be beneficial for the applications that we run, as it we often see peaks in traffic when the
registration for events open.

### The Network

The network is a VPC running in the eu-north-1 region. We will make use of all three availability zones in the region.
The VPC will be split into two groups of subnets, one for public traffic and one for private traffic. The public subnets
reach the internet through an Internet Gateway, and the private subnets reach the internet through the fck-nat gateway.

The ALB is placed into the public subnets, and is allowed to reach the nodes through security group rules. The nodes are
placed into the private subnets, preventing communication with the public internet. We will also deploy RDS instances
and other services into the private subnets. Because it's always possible to reach private services through SSM, we make
it harder for any external actor to reach the services, without compromising on access for authorized users.

## Deployment

The core platform is managed in a Terraform project in the terraform-monorepo. This project is responsible for
provisioning the ECS clusters, ALBs, VPCs and other shared infrastructure.

Each application that wants to be deployed on the platform is managed in separate Terraform projects, using Terraform
`data` blocks to reference the shared infrastructure. We will provide Terraform modules to make it easier for teams to
deploy their own applications.

## Glossary

This section contains definitions of terms that are used in this document. In order to keep the document
beginner-friendly, we will provide a glossary with further resources for each term.

- VPC: A virtual private cloud (VPC) is an internal network that is isolated from the rest of the internet. It resides
  in a single AWS region and is used to isolate resources from each other. A use case is for example to ensure that a
  database is not publicly accessible from the internet, but only from within the VPC.
  1. VPCs: https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html
- Subnet: A subnet is an IP range inside the VPC that can be used to provide another layer of isolation. It is also used
  to provide high-availability for services that are running in the VPC. An example is deploying a web service in three
  different subnets, each within a different availability zone. This way, if there is an outage in one availability zone,
  the service will still be available in the other two.
  1. Subnets: https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html
  2. Regions & AZs: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html
- ECS: Elastic Container Service (ECS) is a fully-managed container service from AWS. In kubernets terms it's merely the
  orchestrator and control plane. It's used to run containers on an ECS backend. AWS provides three different types of
  backends, which are explained in the following sections. The backend is a node that picks up container tasks and runs
  them on a container runtime (Docker). By selecting a backend, you practically choose where the containers will run.
  - AWS ECS on Fargate: This is a managed service by AWS that is quite pricey, but very easy to use. The containers will
    run on AWS-managed infrastructure making it very reliable and accessible. The downside is that it costs a lot, and
    if you're interested in more advanced deployments such as sidecars or host observability, you will end up fighting
    against Fargate.
  - AWS ECS on EC2: Here you run the containers on your own provisioned EC2 instances. This is significantly cheaper,
    but you are now in charge of running the nodes yourself.
  - AWS ECS Anywhere: Run the containers on-premise, but we don't have on-premise anymore, and networking becomes more
    complicated.
- Kubernetes: Kubernetes is a container orchestration platform. That means that it's responsible for running workloads
  on containers. Because ECS is similar to Kubernetes, we will use similar terminology. A kubernetes cluster typically
  consists of the following components:
  - Control Plane: the interface where you can view, update, and manage the nodes, pods, and containers in your cluster.
  - Nodes: the machines that run the containers.
  Kubernetes is very powerful and it's sort-of the standard for container orchestration in large companies and
  organizations. See the architecture section on why we are not running Kubernetes.
  1. Kubernetes: https://kubernetes.io/
- Node: A node is a pretty generic term in computing, but in both ECS and Kubernetes it refers to a machine that runs
  containers. The orchestrator will often have multiple nodes that can run containers, especially in organizations where
  there are many teams running many applications, each with multiple containers.
- Pod/Task: An ECS task is similar in concept to a Kubernetes pod. A pod is a group of containers that are scheduled to
  run on the same node. Often, the containers in the pod are related to each other, such as a web server and a
  PostgreSQL database. For high-availability it is common to run the same pod on multiple nodes.
- Container: A container is a workload that is packaged with all the dependencies it needs to run. We will only use
  Docker, but there are many other container runtimes like containerd, CRI-O, etc.
- ALB: Application Load Balancers are "entrypoints" or gateways into your applications. They are used to route traffic
  to your applications based on the rules you define. You can for example route traffic that has a `Host` header with
  the value `online.ntnu.no` to a specific service, while routing all other traffic to another service.
  1. AWS ALB: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html
