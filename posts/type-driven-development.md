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

- [Introduction](#introduction)
    - [TLDR](#tldr)
- [The Square Jigsaw Table](#the-square-jigsaw-table)
    - [Why did this happen?](#why-did-this-happen)
    - [Specification & Proof](#specification--proof)
- [Type Driven Development](#type-driven-development)
    - [What does this mean?](#what-does-this-mean)
- [Case Study: Online Shopping](#case-study-online-shopping)
- [Code Demo](#code-demo)
    - [Step 0: Structure](#step-0-structure)
    - [Step 1: Edge Behaviour: `List[ShoppingListItem] => F[List[ItemConfirmation]]`](#step-1-edge-behaviour-listshoppinglistitem--flistitemconfirmation)
    - [Step 2: Dependencies](#step-2-dependencies)
    - [Step3: Deriving Proof](#step3-deriving-proof)
        - [Explanation: Monad, Functor & Higher Kinded Types](#explanation-monad-functor--higher-kinded-types)
        - [`ItemConfirmation` transformers](#itemconfirmation-transformers)
        - [Transformers to return complete `List[ItemConfirmation]`](#transformers-to-return-complete-listitemconfirmation)
        - [`toItemConfirmation` transformer](#toitemconfirmation-transformer)
- [Conclusion](#conclusion)
    - [Complete Source Code](#complete-source-code)

<!-- markdown-toc end -->
# Introduction
We use a Kanban/Agile mix methodology in our projects and we came across on an interesting problem when implementing a new feature. Rather than trying to explain it in vague terms, I am going to start with a story.

## TLDR
In case you don't want to dive in just yet, here is the idea we will cover in this post.

> Think about the behaviour of your program in terms of data types & functions signatures. Next step is to `prove` or `derive` a function that composes all of the types & signatures to implement the feature. Then carry on to implement each of the individual functions with the guarantee that all functions will compose together.

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

# Case Study: Online Shopping 

Imagine that we have to build a service that:

* Takes `Shopping List`
* Checks for available items
* Orders available items
* Returns consolidated list of ordered items and not found items

While this sounds straightforward and simple, defining all of this via program and ensuring it works well is not so easy.

To start off with, here's a flow diagram that shows the above steps along with some of the hidden tasks also illustrated.

![Shopping process](/images/shopping.png)

# Code Demo

Note: In order to make the code properly compose, we will be making use Scala's `Cats` library. I will try to explain how some of the FP concepts make sense in our context. For example, we will be using `Monad` & `Functor` to begin with.

## Step 0: Structure
We start with four `object`s with predefined purpose as explained by the comments

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
object Specification {}
```

## Step 1: Edge Behaviour: `List[ShoppingListItem] => F[List[ItemConfirmation]]`
Based on the flow diagram, if we think from Customer's perspective we know that:

* Customer has a `shopping list` which consists of a `list` of `items` & `quantity` to buy.
* Upon ordering, Customer will have a `list` which `confirms` if the `items` & `quantity` requested were bought.

We can represent in code with following domain models & functions.

```scala
package sandbox

import sandbox.DataTypes._

object DataTypes {
  // Primitive Data Types
  case class ItemName(name: String)
  case class Quantity(number: Int)
  case class Confirmed(ordered: Boolean)

  // Compound Data Types
  case class ShoppingListItem(item: ItemName, quantity: Quantity)
  case class ItemConfirmation(
      item: ItemName,
      quantity: Quantity,
      confirmed: Confirmed
  )
}

object Specification {
  type Service[F[_]] = List[ShoppingListItem] => F[List[ItemConfirmation]]

  def proof[F[_]]: Service[F] = ???
}
```

## Step 2: Dependencies
We also have two external dependencies

**Catalog** let's us translate `ItemName` into `ItemId` which is available within the system. **Catalog** behaves as follows:

* If `ItemName` exists in the system and has `ItemId`, it will return `(ItemName, Some(ItemId))`
* If `ItemName` exists but does not have `ItemId`, it will return `(ItemName, None)`
* If `ItemName` does not exist in the system, it will not be returned by the system

***Shop*** is used to order items that can be found in the system. It behaves as follows:

* For given `ItemId` & `Quantity`, it will return those details along with `Confirmation`
* `Confirmation` denotes whether the quantity of item was successfully ordered or not

All this can be represented in the code as follows.

```scala
package sandbox

import scala.annotation.StaticAnnotation

import DataTypes._

case class Note(message: String) extends StaticAnnotation

object DataTypes {
  // ...
  case class ItemId(v: Int)

  // ...
  case class ShopOrderItem(id: ItemId, quantity: Quantity)
  case class CatalogItem(name: ItemName, id: Option[ItemId])
  case class ShopConfirmation(
      id: ItemId,
      quantity: Quantity,
      confirmed: Confirmed
  )
}

object Dependencies {
  @Note("List[CatalogInfo] <= List[ShoppingListItem]")
  type QueryCatalog[F[_]] = List[ShoppingListItem] => F[List[CatalogItem]]

  type OrderItems[F[_]] = List[ShopOrderItem] => F[List[ShopConfirmation]]
}
```

## Step3: Deriving Proof

We have defined the behaviour of our dependencies and also define how the overall system should behave from Customer's perspective.

### Explanation: Monad, Functor & Higher Kinded Types

* **F[_]** is Higher Kinded Type. That is, it is any type which has a "hole" which can contain another type. Common examples are `Option[Int]`, `List[String]` etc.
* **Monad** for our purpose is a Higher Kinded Type that has `flatMap` implemented for use.
* **Functor** is another Higher Kinded Type that has `map` implemented.

Since we are dealing with `F[_]` in our code, we will need to qualify it as a `Monad` for `flatMap` to work.

Let's see if we can now compose our dependencies to return `List[ItemConfirmation]`

```scala
package sandbox

import cats.Monad
import cats.implicits._

import sandbox.DataTypes._
import sandbox.Dependencies._

object Specification {
  type Service[F[_]] = List[ShoppingListItem] => F[List[ItemConfirmation]]

  def proof[F[_]: Monad](
      queryCatalog: QueryCatalog[F],
      orderItems: OrderItems[F]
  ): Service[F] =
    (items: List[ShoppingListItem]) =>
      for {
        catalog <- queryCatalog(items)
        orderedItems <- orderItems(catalog)
      } yield orderedItems
}
```

If we try to compile the code, we get following error.

```
[error]  found   : List[sandbox.DataTypes.CatalogItem]
[error]  required: List[sandbox.DataTypes.ShopOrderItem]
[error]         orderedItems <- orderItems(catalog)
[error]                                    ^
```
What does this tell us? It tells us that we need function/behaviour with following signature `List[CatalogItem] => List[ShopOrderItem]`.

Let's look at what happens if we define such a function.

```scala
 package sandbox

// ...
import sandbox.Transformers._

object Transformers {
  val toShopOrder: List[CatalogItem] => List[ShopOrderItem] = ???
}

object Specification {
  type Service[F[_]] = List[ShoppingListItem] => F[List[ItemConfirmation]]

  def proof[F[_]: Monad](
      queryCatalog: QueryCatalog[F],
      orderItems: OrderItems[F]
  ): Service[F] =
    (items: List[ShoppingListItem]) =>
      for {
        catalog <- queryCatalog(items)
        shopItems = toShopOrder(catalog)
        orderedItems <- orderItems(shopItems)
      } yield orderedItems
}
```

If we try to compile above code we get
```
[error]  found   : List[sandbox.DataTypes.ShopConfirmation]
[error]  required: List[sandbox.DataTypes.ItemConfirmation]
[error]       } yield orderedItems
[error]               ^
```

### `ItemConfirmation` transformers

Now we know two things:

* We need to define the transformation function `ShopConfirmation => ItemConfirmation`
* We need another transformation function, `ShoppingListItem => ItemConfirmation`. As we already noted that that `List[CatalogItem] <= List[ShoppingListItem]`, this means that in case we have any unavailable items, we have to create `ItemConfirmation` from `ShoppingListItem`.

*Minor update*: We need to properly define the behaviour/flow `(List[ShoppingListItem], List[CatalogItem]) => List[ShopOrderItem]` because `CatalogItem` does not have all the information to be converted to `ShopOrderItem` so we will also need `ShoppingListItem` for complete conversion.


```scala
package sandbox

// ...
import sandbox.Transformers._

object Transformers {
  val toShopOrder: (List[ShoppingListItem], List[CatalogItem]) => List[ShopOrderItem] = ???

  val shopToItemConfirmation: ShopConfirmation => ItemConfirmation = ???

  val itemToItemConfirmation: ShoppingListItem => ItemConfirmation = ???
}

object Specification {

  def proof[F[_]: Monad](...): Service[F] =
    (items: List[ShoppingListItem]) =>
      for {
        // ...
        shopItems = toShopOrder(items, catalog)
        // ...
      } yield orderedItems.map(shopToItemConfirmation)
}
```

### Transformers to return complete `List[ItemConfirmation]`

In order to complete our proof, we need to figure out how to combine the following four domain models using existing `Transformers` and creating new ones if needed.

```scala
case class ShoppingListItem(item: ItemName, quantity: Quantity)

case class CatalogItem(name: ItemName, id: Option[ItemId])

case class ShopConfirmation(
    id: ItemId,
    quantity: Quantity,
    confirmed: Confirmed
)

case class ItemConfirmation(
    item: ItemName,
    quantity: Quantity,
    confirmed: Confirmed
)
```

Based on these four domain models, following is one such solution which requires two main functions:

```scala
case class Pairs(items: ShoppingListItem, confirmations: Option[ShopConfirmation])

val toItemConfirmation: List[Pairs] => List[ItemConfirmation]

val getPairs: (List[CatalogItem], List[ShoppingListItem], List[ShopConfirmation]) => List[Pairs]
```

### `toItemConfirmation` transformer
Let's conclude the spec by implementing the logic for `toItemConfirmation`.

```scala
package sandbox

// ...
import sandbox.DataTypes._
import sandbox.Dependencies._
import sandbox.Transformers._

object DataTypes {
  // ...
  case class Pair(
      listItems: ShoppingListItem,
      confirmations: Option[ShopConfirmation]
  )
}


object Transformers {
  // ...
  val getPairs: (
      List[CatalogItem],
      List[ShoppingListItem],
      List[ShopConfirmation]
  ) => List[Pair] = ???

  val toItemConfirmation: List[Pair] => List[ItemConfirmation] =
    _.map {
      case Pair(item, None) => itemToItemConfirmation(item)
      case Pair(item, Some(confirmation)) =>
        shopToItemConfirmation(item.name, confirmation)
    }
}

object Specification {
  type Service[F[_]] = List[ShoppingListItem] => F[List[ItemConfirmation]]

  def proof[F[_]: Monad: Functor](
      queryCatalog: QueryCatalog[F],
      orderItems: OrderItems[F]
  ): Service[F] =
    (items: List[ShoppingListItem]) =>
      for {
        catalog <- queryCatalog(items)
        shopItems = toShopOrder(items, catalog)
        orderedItems <- orderItems(shopItems)
        pairs = getPairs(catalog, items, orderedItems)
      } yield toItemConfirmation(pairs)
}

```

# Conclusion

I found this style of defining types & "proving" the design to be quite beneficial for clarity of thought. And as I kept introducing types it was easier to see how the code would flow and whenever I felt something was unclear, I could start adding more details and thus get rid of nasty surprises at the earliest.

As I kept working on this, I came across the concept of **Dependent Types** and that is indeed something I intend to dig into. It would be interesting to see where the two concepts intersect and where they are geometrically opposed.

## Complete Source Code

For the sake of completeness, I am providing the complete code of everything I have described in this blog post in one single section.

```scala
package sandbox

import scala.annotation.StaticAnnotation

import cats.Monad
import cats.implicits._

import sandbox.DataTypes._
import sandbox.Dependencies._
import sandbox.Transformers._
import cats.Functor

object Transformers {
  val toShopOrder
      : (List[ShoppingListItem], List[CatalogItem]) => List[ShopOrderItem] = ???

  val shopToItemConfirmation: (ItemName, ShopConfirmation) => ItemConfirmation =
    ???

  val itemToItemConfirmation: ShoppingListItem => ItemConfirmation = ???

  val getPairs: (
      List[CatalogItem],
      List[ShoppingListItem],
      List[ShopConfirmation]
  ) => List[Pair] = ???

  val toItemConfirmation: List[Pair] => List[ItemConfirmation] =
    _.map {
      case Pair(item, None) => itemToItemConfirmation(item)
      case Pair(item, Some(confirmation)) =>
        shopToItemConfirmation(item.name, confirmation)
    }
}

object Specification {
  type Service[F[_]] = List[ShoppingListItem] => F[List[ItemConfirmation]]

  def proof[F[_]: Monad: Functor](
      queryCatalog: QueryCatalog[F],
      orderItems: OrderItems[F]
  ): Service[F] =
    (items: List[ShoppingListItem]) =>
      for {
        catalog <- queryCatalog(items)
        shopItems = toShopOrder(items, catalog)
        orderedItems <- orderItems(shopItems)
        pairs = getPairs(catalog, items, orderedItems)
      } yield toItemConfirmation(pairs)
}

case class Note(message: String) extends StaticAnnotation

object DataTypes {
  // Primitive Data Types
  case class ItemName(name: String)
  case class Quantity(number: Int)
  case class Confirmed(ordered: Boolean)
  case class ItemId(id: Int)

  // Compound Data Types
  case class ShoppingListItem(name: ItemName, quantity: Quantity)
  case class ItemConfirmation(
      item: ItemName,
      quantity: Quantity,
      confirmed: Confirmed
  )
  case class ShopOrderItem(id: ItemId, quantity: Quantity)
  case class CatalogItem(name: ItemName, id: Option[ItemId])
  case class ShopConfirmation(
      id: ItemId,
      quantity: Quantity,
      confirmed: Confirmed
  )

  case class Pair(
      listItems: ShoppingListItem,
      confirmations: Option[ShopConfirmation]
  )
}

object Dependencies {
  @Note("List[CatalogInfo] >= List[ShoppingListItem]")
  type QueryCatalog[F[_]] = List[ShoppingListItem] => F[List[CatalogItem]]

  type OrderItems[F[_]] = List[ShopOrderItem] => F[List[ShopConfirmation]]
}

```
