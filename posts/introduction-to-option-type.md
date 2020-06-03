<!--
.. title: Introduction to Option Type
.. slug: introduction-to-option-type
.. date: 2020-06-01 00:38:34 UTC+02:00
.. tags: software design, functional programming, programming, scala, FP for sceptics, FP for sceptics
.. category: 
.. link: 
.. description: Introduction to Option Type. A beginner friendly, crisp & concise article on how to think and reason about Option type.
.. type: text
-->

In Functional Programming we define our system in terms of ADTs, data flow & functions. We start by defining "Happy Path" and then move on to handle exceptions or "Unhappy Path". `ADTs in Practice` used Exceptions (`IO.raiseError`) to signal bad state and cut the flow short. 

Functional Programming is based around mathematical concepts (Type Theory) and they don't have "Exceptions" as defined in Imperative Programming. They use special constructs or types instead. Here are a few:

- `Option`
- `Either`
- `Monad`
- _etc._

> `Option` type denotes presence (`Some(value)`) or absence (`None`) of a value.

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
{{% promptmid %}}

In programming, we use functions and methods to perform an action and return a value[^1]. Depending upon the logic we may or may not have a return value. In case of Imperative Programming, this is expressed either as `null` or an `Exception`; In Functional programming we make use of `Option` type.

Is this a useful construct? Consider retrieving a value from a HashMap or Dictionary.

```scala
val hMap: Map[Int, Int] = Map(1 -> 102, 2 -> 202, 3 -> 302)

hMap.get(100) // What should be the value here? `100` does not exist in `hMap`
```
In non-FP languages, we need to do null check or have exception handling around `hMap.get`.

In FP languages, an `Option` is returned and depending upon the flow of the program, we have two ways of dealing with it:

* **Extract value**
* **Work within Option context**

# Extract value
This is useful when we want to directly work with a value. There are two ways to extract a value from an `Option`

* **getOrElse**
* **Pattern Matching**

## `getOrElse`

```scala
def getString(opt: Option[String]): String = "Got Value: " + opt.getOrElse("None")

getString(Some("100")) // "Got Value: 100"

getString(None) // "Got Value: None" 
```

## Pattern Matching

```scala
def extractFromOption(opt: Option[String]): String =
  opt match {
    case None        => "Got Value: " + "None"
    case Some(value) => "Got Value: " + value
  }

extractFromOption(Some("100")) // "Got Value: 100"

extractFromOption(None) // "Got Value: None" 
```

## What about `.get`?
`Option` type also has `.get` method but it's not safe to use as `None.get` will throw an exception and we want to avoid running into such errors.

> Note that `Option` ensures that we will never run into `NullPointerException` thanks to `.getOrElse` & pattern matching. 

Next let's look at how to work with `Option` without extracting the value at every turn which can get cumbersome.

# Work within Option context
If we have a bunch of functions that accept concrete inputs (not `Option`) and/or we only want to execute code when a value is available ie., on `Some` but not on `None`; In such cases, we want to work within "`Option` context".

Consider the flow in diagram:

```diagam
getOptionValue -> ??? -> addTen -> ??? -> asString -> extractFromOption
```
which is defined by the following methods

```scala
val hMap: Map[Int, Int] = Map(1 -> 102, 2 -> 202, 3 -> 302)

def getOptionValue(i: Int): Option[Int] = hMap.get(i)

def addTen(i: Int): Int = i + 10

def asString(value: Int): String = s"Got Value: $value"
```

There are two ways of working within `Option context`

## Using `map` to compose our functions

```scala
def mapOpt(i: Int) =
  getOptionValue(i)
    .map(addTen)
    .map(asString)

extractFromOption(mapOpt(3)) // "Got Value: 302"

extractFromOption(mapOpt(100)) // "Got Value: None"
```

```diagram
<Show how code flow/shortcircuits for both values>
```

## Using `for-comprehension` or `flatMap`[^2]

```scala
def forOpt(i: Int) =
  for {
    value <- hMap.get(i)
    val10 <- Some(addTen(value))
    str   <- Some(asString(val10))
  } yield str

extractFromOption(forOpt(3)) // "Got Value: 312"

extractFromOption(forOpt(100)) // "Got Value: None"
```

> In both cases of working within `Option` context, our code reads straightforward without excessive error handling. This is also one of the major advantages of using a `Option` type.

{{% promptend %}}

# Conclusion

In this post we looked at what is an `Option` type, how & why to use it.

We saw how it allows us to deal with `null` case explicitly so that we don't run into `NullPointerException` or similar issues. The code is also more elegant to read.

In my next post I will cover **where, when and to what extent** `Option` type is useful in context of a practical application.

[^1]: For sake of simplicity we are ignoring mutablity and impure functions.
[^2]: If you are unfamiliar with how `flatMap` or `for-comprehension` works, you can ignore `for-comprehension` for now.
I will be covering `map/flatMap` in a future post.