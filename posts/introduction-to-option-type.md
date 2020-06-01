<!--
.. title: Introduction to Option Type
.. slug: introduction-to-option-type
.. date: 2020-06-01 00:38:34 UTC+02:00
.. tags: 
.. category: 
.. link: 
.. description: 
.. type: text
-->

In Functional Programming we define our system in terms of ADTs, data flow & functions. We start by defining "Happy Path" and then move on to handle exceptions or "Unhappy Path". `ADTs in Practice` used Exceptions (`IO.raiseError`) to signal bad state and cut the flow short. 

Functional Programming is based around mathematical concepts (Type Theory) and they don't have "Exceptions" as defined in Imperative Programming. They use special constructs or types instead. Here are a few:

- `Option`
- `Either`
- `Monad`
- _etc._


```diagram

Option Type:
  - Some(value)
  - None

Usage
  - for-comprehension
  - map/flatMap

Extracting value
  - getOrElse
  - Pattern Match

```

# `Option` Type

> `Option` type denotes presence (`Some(value)`) or absence (`None`) of a value.

In programming, we use functions and methods to perform an action and return a value[^1]. Depending upon the logic we may or may not have a return value. In case of Imperative Programming, this is expressed as `null`. In Functional programming we make use of `Option` type.

The most common usecase is to retrieve a value from a HashMap or Dictionary.

```scala

val hMap: Map[Int, String] = Map(1 -> "One", 2 -> "Two", 3 -> "Three")

hMap.get(100) // What should be the value here? `100` does not exist in `hMap`

```




# MOVE TO `OPTION TYPE IN PRACTICE`
Let's design a simple system using `Option Type`. 
```diagram
# How would you design this system using Option type?

Some(config) <- {
    config-from-file, => Some(config1)
    config-from-env   => Some(config2)
}

config => start_system => ping_db => check flag => ping dependency => log_message => quit

```

The system will:

- Read configuration from 
    - Files
    - Environment variables
- Start System
- Ping DB to check if alive
- Check Dep flag
    - Ping dependency
- Log message
- Quit


[^1]: For sake of simplicity we are ignoring mutablity and impure functions.