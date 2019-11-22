<!--
.. title: Understanding Either & EitherT
.. slug: understanding-either-eithert
.. date: 2019-10-23 10:11:24 UTC+02:00
.. tags:
.. category:
.. link:
.. description:
.. type: text
-->



---

In this post, I want to discuss how to use `Either` & `EitherT` to write elegant and compact code using Functional Scala & `Typelevel Cats`. However before we delve into these two topics, it is important to have a good grasp of how to work with `Effect`s in Scala and in our case, `IO`.

# Cats Effect: IO

`IO` is used to represent any and all impure computations.

## Pure vs. Impure Computations

In programming, all code/computation/functions can be classified as one of two types:

- `Pure Functions`: Code that will always return same output for same input
- `Impure Functions`: Code whose output can vary based on other factors

For example, `sum of two numbers` is a `Pure Function` which will return the same result everytime it is called with the same two numbers.

```scala
def sum(a: Int, b: Int): Int = a + b

// Calling the same "Pure" function multiple times
val firstTry = sum(1, 2)
val secondTry = sum(1, 2)
val thirdTry = sum(1, 2)
val fourthTry = sum(1, 2)

// This assertion will not throw AssertionError
assert(firstTry == secondTry && secondTry == thirdTry && thirdTry == fourthTry)
```

A simple example of an `Impure Function` is getting the current timestamp.

```scala
def getTimestamp: Long = System.currentTimeMillis()

// Calling an "Impure" function multiple times
val firstTry = getTimestamp
val secondTry = getTimestamp

// This assertion will throw AssertionError
assert(firstTry == secondTry)
```

However whenever we deal with such impure functions, the convention is to wrap
