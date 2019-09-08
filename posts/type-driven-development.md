<!--
.. title: Type Driven Development
.. slug: type-driven-development
.. date: 2019-09-08 16:11:55 UTC+02:00
.. tags: 
.. category: 
.. link: 
.. description: 
.. type: text
.. status: draft
-->

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
**Table of Contents**

- [The Square Jigsaw Table](#the-square-jigsaw-table)
    - [Why did this happen?](#why-did-this-happen)
    - [Specification & Proof](#specification--proof)
- [Type Driven Development](#type-driven-development)
    - [What does this mean?](#what-does-this-mean)
- [Online Shopping using TyDD](#online-shopping-using-tydd)
    - [How do we shop?](#how-do-we-shop)

<!-- markdown-toc end -->

We use a Kanban/Agile mix methodology in our projects and we came across on an interesting problem when implementing a new feature. Rather than trying to explain it in vague terms, I am going to tell a story which is in the same spirit.

# The Square Jigsaw Table
Master Carpenter was asked to create a square table which was made of four big square blocks that connect together like a jigsaw puzzle. Four colours were to be used - Red, Green, Yellow & Teal.

![Four coloured blocks of jigsaw](/images/orig.jpg)


The master carpenter had to go out of town and so he distributed the task among his four apprentices. He gave them following instructions to build:

* Each of you - `A`, `B`, `C` and, `D`, needs to build a square 
* One side should have semicircle slot approximately 10% radius
* The adjacent side should have a peg to fit the slot
* It should have one of four colours - Red, Green, Yellow & Teal
* If they don't perfectly fit at the end, I will finish the work once I am back
* Since each of you will be working on your own, keep everyone updated of your progress

During his journey, the craftsman was kept up to date by all of his apprentices. Their updates had the same gist.
> The work is coming along great. I had to make some slight modifications but it is nothing major, it should be a quick fix once you are back.

On his return, the craftsman asked the four apprentices to give him the blocks so he could start working on completing the table. But when they presented him with the four blocks, he realized that they had a big problem. Turns out that while each of the apprentices followed his instructions to the letter, none had thought about how they would fit together.

![A block with 2x size, a lock with peg at top & a block with smaller hole](/images/apprentice-blocks.jpg)

**Some of them even forgot that the goal of building these blocks was to combine them at the end!**

## Why did this happen?
I am sure that everyone has faced this problem at some point in their career. Feature/User Story gets broken down into small tickets and then developers pick up individual tickets to implement them. The expected result is that at the end they will all fit together. This happens because developers need to narrow their focus so that they can implement the ticket to the best of their ability. However the drawback is that the holistic view is lost and it is very easy to not realize how a minor change can impact the overall feature.

## Specification & Proof

One way to avoid this issue is by defining behaviour of the final product with **just enough** information that everyone can work on their own with confidence. If we take the example of our four blocks, we can specify the behaviour and components using the block colours, pegs & holes of the four blocks and how they will connect. Here is what the apprentices were given to work with.

![Pegs & holes of the four blocks is defined along with how they are connected. Rest of the block is missing.](/images/glue-code.jpg)

Now each of the apprentices can use the block's skeleton to create his/her own block as (s)he knows the size, colour and position of peg & hole.

# Type Driven Development
We can achieve similar results with greater flexibility using Types & interfaces. Before we look at "How?" let's first define it.

> Type Driven Development lets you define the behaviour in terms of:

> * Components (Function Types)

> * Domain models (Data Types).

Once these specifications are in place, everyone can branch out to implement their individual tasks.

## What does this mean?
In essence we want to "prove" our design and rest assured that after we have started implementing the tickets, the components will work as expected and this can be done by way of types. If you use statically typed programming languages this should be relatively straightforward to achieve.

Good news is that we don't need to use a formal specification system like TLA+ or Coq but use plain old types and/or interfaces. An important point to keep in mind is that this is not a document but living code!

Let's use the example of online shopping with Type Driven Development to get a deep understanding of how it can be done.

# Online Shopping using TyDD

## How do we shop? 
* We start with a `Shopping List`
* Next, we check which of these items are available
* Then, we order the found items
* And make note of items we could not find.

While this sounds straightforward and simple, defining all of this via program and ensuring it works well is not so easy.

To start off with, here's a flow diagram that shows the above steps along with some of the hidden tasks that are also needed.

![Shopping process](/images/shopping.png)

```scala
package sandbox

//Domain Models
object DataTypes {}

// Functions that will be used to transform data
object Transformers {}

// Functions that are used to represent outside services
object Dependencies {}

// We will use the above three objects and their inner components
// here to prove that they will indeed work together
object Proof {}
```


```scala
package sandbox

import DataTypes._

object DataTypes {
  // Primitive Data Types
  case class ItemName(v: String)
  case class Quantity(v: Int)
  case class Confirmed(v: Boolean)

  // Compound Data Types
  type ShoppingListItem = (ItemName, Quantity)
  type ItemConfirmation = (ItemName, Quantity, Confirmed)
}

object Specification {
  type ToProve[F[_]] =
    List[ShoppingListItem] => F[List[ItemConfirmation]]

  def proof[F[_]]: ToProve[F] = ???
}
```

```scala
package sandbox

import DataTypes._

object DataTypes {
  // ...
  case class ItemId(v: Int)


  // ...
  type ShoppingCartItem = (ItemId, Quantity)
  type CatalogInfo = (ItemName, Option[ItemId])
}

object Dependencies {
  type QueryCatalog[F[_]] = List[ShoppingListItem] => F[List[CatalogInfo]]
  type OrderItems[F[_]] = List[ShoppingCartItem] => F[List[ItemConfirmation]]
}
```


```scala
package sandbox

import DataTypes._
import Dependencies._

// ...

object Specification {
  type FinalSignature[F[_]] =
    List[ShoppingListItem] => F[List[ItemConfirmation]]

  def proof[F[_]](queryCatalog: QueryCatalog[F]): FinalSignature[F] =
    (items: List[ShoppingListItem]) => {
      queryCatalog apply items
    }
}
```

```scalac
type mismatch;
 found   : sandbox.Dependencies.OrderItems[F]
    (which expands to)  List[(sandbox.DataTypes.ItemId, sandbox.DataTypes.Quantity)] =>
                            F[List[(sandbox.DataTypes.ItemName, sandbox.DataTypes.Quantity, sandbox.DataTypes.Confirmed)]]
 required: F[List[sandbox.DataTypes.CatalogInfo]] => ?
    (which expands to)  F[List[(sandbox.DataTypes.ItemName, Option[sandbox.DataTypes.ItemId])]] => ?scalac
```

```scala
 package sandbox

import DataTypes._
import Dependencies._

object DataTypes {
  // ...

  type ShopConfirmation = (ItemId, Quantity, Confirmed)
}

object Dependencies {
  // Modified to return ShopConfirmation instead.
  type OrderItems[F[_]] = List[ShoppingCartItem] => F[List[ShopConfirmation]]
}

object Specification {
  type FinalSignature[F[_]] =
    List[ShoppingListItem] => F[List[ItemConfirmation]]

  def proof[F[_]](
      queryCatalog: QueryCatalog[F],
      orderItems: OrderItems[F]
  ): FinalSignature[F] =
    (items: List[ShoppingListItem]) => {
      // (List[ShoppingListItem] => F[List[CatalogInfo]]) >>>
      // (List[ShoppingCartItem] => F[List[ShopConfirmation]])
      queryCatalog andThen orderItems apply items
    }
}
```

```scalac
type mismatch;
 found   : sandbox.Dependencies.OrderItems[F]
    (which expands to)  List[(sandbox.DataTypes.ItemId, sandbox.DataTypes.Quantity)] =>
                            F[List[(sandbox.DataTypes.ItemId, sandbox.DataTypes.Quantity, sandbox.DataTypes.Confirmed)]]
 required: F[List[sandbox.DataTypes.CatalogInfo]] => ?
    (which expands to)  F[List[(sandbox.DataTypes.ItemName, Option[sandbox.DataTypes.ItemId])]] => ?
```
