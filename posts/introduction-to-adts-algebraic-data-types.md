<!--
.. title: Introduction to ADTs (Algebraic Data Types)
.. slug: introduction-to-adts
.. date: 2020-04-14 00:31:05 UTC+02:00
.. tags: software design, type driven development, functional programming, programming, scala
.. category: 
.. link: 
.. description: Introduction to Algebraic Data Types. A detailed beginner friendly post on why and how to use ADTs.
.. type: text
-->

Algebraic Data Types (or ADTs) abstract the flow our program (or system) into data & functions by breaking it into distinct domains or compartments.

Let's grok via examples:

## Example: Mathematics

> Calculate the area of a rectangle from a list of positive integers

Here's one possible program algorithm:

* Take a list of integers (positive & negative)
* Filter out negative ones to collect positive integers
* Create pairs from the filtered list
* Apply equation for area of rectangle

### Types without ADTs

Base functions:

```scala
def filterPositives(allIntegers: List[Int]): List[Int] = allIntegers.filter(_ > 0)

def toPairs(positiveIntegers: List[Int]): List[(Int, Int)] =
    positiveIntegers.map(i => (i, i))

def toAreaList(pairs: List[(Int, Int)]): List[Int] = pairs.map({ case (l: Int, b: Int) => l * b })
```

We can now express our program in terms of these functions:

```scala

def program(allIntegers: List[Int]): List[Int] = {
    val positiveIntegers: List[Int] = filterPositives(allIntegers)
    val pairsOfPositiveIntegers: List[(Int, Int)] = toPairs(positiveIntegers)
    
    toAreaList(pairsOfPositiveIntegers)
}

// Elegant alternative

def elegantProgram(allIntegers: List[Int]): List[Int] =
    toAreaList _ compose toPairs compose filterPositives apply allIntegers

```

That's awesome but if we look at data types, it's a bit harder to follow:

```scala

type program = 
    (List[Int] => List[Int]) =>               // filterPositives
        (List[Int] => List[(Int, Int)]) =>    // toPairs 
            (List[(Int, Int)] => List[Int])   // toAreaList

```

### Types with ADTs

That's a crazy amount of `List`s, `Int`s and `List of Int`s to follow around.

Is there a better way to abstract it? What if we used diagrams?

![ADT Flow](/images/adt-flow.png)

I think this is a very nice way to look at problem domain. The diagram shows the functions used for transformation:

* `filterPositives`
* `toPairs`
* `toAreaList`

Stages of Data:

* `All Integers`
* `Posiives`
* `Positive Pairs`
* `Areas`

and finally, the type of data, `Z`, `Z+` etc.

In previous example, we had functions & types of data being passed around but nothing to describe the stages of data.

This is where ADT comes in.

> ADT is a data class (`case class`es in Scala) that encapsulates our primitive types into more domain specific descriptive types.

Let's start by describing stages of our data:

```scala

case class AllIntegers(items: List[Int])
case class Positives(items: List[Int])
case class PositivePairs(items: List[(Int, Int)])
case class Areas(items: List[Int])

```

Now our function signatures change to:

```scala
def filterPositives(allIntegers: AllIntegers): Positives = Positives(allIntegers.items.filter(_ > 0))

def toPairs(positiveIntegers: Positives): PositivePairs =
    PositivePairs(positiveIntegers.map(i => (i, i)))

def toAreaList(pairs: PositivePairs): Areas = Areas(pairs.map({ case PositivePairs(l: Int, b: Int) => l * b }))
```

The data flow changes to:

```scala

type program = 
    AllIntegers =>
        Positives =>     // filterPositives
        PositivePairs => // toPairs
        Areas            // toAreaList
```

The program can be written as

```scala

def elegantProgram(allIntegers: AllIntegers): Areas = // Note the types used for input & output
    toAreaList _ compose toPairs compose filterPositives apply allIntegers

```

An important thing to appreciate here is that using ADTs now makes it harder to make mistakes with function composition. For example, when we were using primitive types, we could've easily written following code which would compile and run

```scala
def programPrimitiveTypes(allIntegers: List[Int]): List[Int] = allIntegers

def programADTs(allIntegers: AllIntegers): Areas = allIntegers // Compiler error!
```

However with ADTs, we have the compiler on our side ensuring the program is typesafe and correct.

I hope this shows you of the value of ADTs and what they bring to the game.