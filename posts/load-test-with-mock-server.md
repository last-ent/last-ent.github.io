<!--
.. title: Isolate your Load Tests with a Mock Server
.. slug: load-tests-with-mock-server
.. date: 2019-09-03 11:04:08 UTC+02:00
.. tags: software architecture, system design, scalability
.. category: 
.. link: 
.. description: 
.. type: text
.. status: draft
-->

## Introduction
* We need to understand how our system behaves under load
* We want to do it with test data
* Not all of our downstream dependencies have test or sandbox environments
* It is not easy to get test data
* An End-to-End Load Test is not easy to arrange because it would affect a lot of systems and can also impact production systems if we are not careful

## How can you test your system if you can't rely on downstream services?
> Plug it into your Dependency Mock Server

## What is a **Dependency Mock Server**?
* It is a small & flexible server that provides endpoints to all of your dependencies.
* Lets you respond back with dynamic response.

## Case Study
* Four environments for our System:
    * Test
    * Mocked
    * Staging
    * Production

* Single Dependency Mock Server with Endpoints for:
    * IAM Authentication
    * Level 2 Authorization
    * Dependency 1 with dynamic GET response
    * Dependency 2 with dynamic POST endpoint
    * Dependency 2 with static POST endpoint

## Why use a **Dependency Mock Server**?
* Involves IO operations
* Minimum **network round trip** is included in the load test
* Easy for **network failures** to show up during load test
* If the **thread pools haven't been properly configured**, it will become obvious during the load test
* Larger payloads will cause larger delays in downstream services which in turn affect our system. A **good simulation of system behaviour**
* We can introduce deliberate delays (sleep) while responding to check for our system's behaviour
* We can introduce deliberate error responses
* We can also test the system under **most ideal conditions**

## Why not use Stubs?
* A stub is an alternative to DMS and thus avoids performing network calls
* It is somewhat easier to set up since it is all part of the same codebase
* It doesn't involve network layer
* Response will be in near instant speeds because it is part of same codebase. Even if we want to introduce basic network latency extra effort has to be put in.
* Only Request/Response thread pools will be tested. No load on HTTP thread pool.

## Fallacies of Distributed Computing
1. 	**The network is reliable**
2. 	**Latency is zero**
3. 	**Bandwidth is infinite**
4. 	The network is secure
5. 	Topology doesn't change
6. 	There is one administrator
7. 	**Transport cost is zero**
8. 	The network is homogeneous



# SLIDES

As Black Friday approaches we all start having the same set of thoughts.

```markdown
# Thoughts in our head

1. How is our system going to perform?
2. How much load can it handle?
3. How many pods do we need?
4. Did we configure our system correctly?
```

These are all important questions and if you don't have data from the past year or worse yet, you have a new service - These are scary thoughts.

I am sure you already know this but this means that you need to Load Test your system.

``` markdown
# Idea way to Load Test
```

