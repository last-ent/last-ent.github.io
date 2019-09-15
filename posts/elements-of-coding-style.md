<!--
.. title: Elements of Coding Style
.. slug: elements-of-coding-style
.. date: 2019-09-15 11:04:43 UTC+02:00
.. tags: programming, musings, software engineering, enterprise software development
.. category: 
.. link: 
.. description: Enterprise Software Development is known to be verbose and very formal. Everyone has come to accept this style as (un)necessary evil. However there really isn't any reason for this to be the case. In this post, I list some basic principles, that if followed even in enterprise, can simplify and lead to a simple style that is easier to work with and thus improve reliability & throughput of code.
.. type: text
-->

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
**Table of Contents**

- [Rules of Software Engineering](#rules-of-software-engineering)
- [Elements of Coding Style](#elements-of-coding-style)
    - [Human Readable Code](#human-readable-code)
        - [Functional Naming](#functional-naming)
            - [Think in terms of functionality, not types](#think-in-terms-of-functionality-not-types)
            - [Write in terms of verbs, not instructions](#write-in-terms-of-verbs-not-instructions)
            - [Don't leak implementation in names](#dont-leak-implementation-in-names)
    - [Signal to Noise ratio](#signal-to-noise-ratio)
        - [Readable Code](#readable-code)
            - [Keep the code concise](#keep-the-code-concise)
            - [Word agglutination doesn't help with code readability](#word-agglutination-doesnt-help-with-code-readability)
            - [Readable code is debuggable code](#readable-code-is-debuggable-code)
        - [Think Enterprise, Write Simple](#think-enterprise-write-simple)
            - [Use Function Type for simple cases](#use-function-type-for-simple-cases)
            - [Use traits when](#use-traits-when)
                - [Multiple functions/methods logically make sense to be grouped together (standard use case)](#multiple-functionsmethods-logically-make-sense-to-be-grouped-together-standard-use-case)
                - [Single function call might require data that shouldn't be visible to caller](#single-function-call-might-require-data-that-shouldnt-be-visible-to-caller)
            - [Think in terms of What & Why, not How](#think-in-terms-of-what--why-not-how)
            - [That's not how people speak](#thats-not-how-people-speak)

<!-- markdown-toc end -->


# Rules of Software Engineering
There are three important rules in Software Engineering.

* **Rule 1: Easy to understand**. Anyone should be able to pick up the code and start working on it.
* **Rule 2: Easy to debug**. If the code breaks, it should be easy to quickly investigate & identify where is the issue.
* **Rule 3: Shipping is the most important feature**. No matter how correct or elegant your code is, if you can't ship working code on time then why bother?

Having said that, `Rule 3` should rarely be in opposition to `Rule 1 & 2`. If you have to veto `Rule 1 & 2` to ship your feature, then something's horribly wrong in your code & process. Complexity in code is a given and it is an engineer's responsibility to figure out how best to contain the damage and stop it from affecting the rest of the system.

> Less elegant yet easy to understand & easier to debug should be the minimum expectation from all code shipped.

# Elements of Coding Style

I think all good code has following `Elements`. These `elements` are not unique to any single programming language or paradigm, they are universal to how humans think and make sense of abstractions.

## Human Readable Code

> A computer language is not just a way of getting a computer to perform operations [...] programs must be written for people to read, and only incidentally for machines to execute.

*~ Structure & Interpretation of Programming Languages*

### Functional Naming

#### Think in terms of functionality, not types

```scala

trait CatalogMappingService {
  def getMappingFor(cId: CatalogId): ProductId
}

class CatalogMappingServiceImpl extends CatalogMappingService {...}

val catalogMappingService: CatalogMappingService =
    new CatalogMappingServiceImpl()

val productId: ProductId = catalogMappingService.getMappingFor(catalogId)

// vs


trait Catalog {
  def get(cId: CatalogId): ProductId
}

class CatalogService extends Catalog {...}

val catalog: Catalog = ???

val productId: productId = catalog.get(catalogId)
```

#### Write in terms of verbs, not instructions

```scala
if(porfolioIdsByTraderId.get(trader.getId())
    .containsKey(portfolio.getId())) {...}
    
// vs

if(trader.canView(portfolio)) {...}

```
#### Don't leak implementation in names

```scala

val catalogIdToProductIdMap: Map[CatalogId, ProductId] = ???

// vs

val catalog: Map[CatalogId, ProductId] = ???
```
## Signal to Noise ratio

![Signal to Noise Ratio: Word Length vs. Understandability of Code](/images/snr.png)

### Readable Code

#### Keep the code concise

> To be or not to be, that is the question.

**vs.**

> Continuing of existence or cessation of existence, those are the scenarios.


#### Word agglutination doesn't help with code readability

#### Readable code is debuggable code

> People will be using the words you choose in their conversation for the next 20 years. [...] Unfortunately, many people get all format [...]. Just calling it what it is isn't enough.

*~Kent Beck*


### Think Enterprise, Write Simple

#### Use Function Type for simple cases

#### Use traits when

##### Multiple functions/methods logically make sense to be grouped together (standard use case)

##### Single function call might require data that shouldn't be visible to caller

```scala
trait Catalog {
  def query(id: CatalogId): (CatalogId, Option[CatalogPrice])
}

class CatalogClient implements Catalog {
  def query(id: CatalogId): (CatalogId, Option[CatalogPrice]) = ???
}

// vs

object Catalog {
  type QueryCatalog = CatalogId => (CatalogId, Option[CatalogPrice])
  
  val query: QueryCatalog = ???
}

```

#### Think in terms of What & Why, not How

#### That's not how people speak

> Can you explain how your Online Shopping API works?

>> You send your shopping list to Shopping List API, which calls Item Catalog Service to retrieve list of available items which have Item Id. The items are then sorted into list of items with Item Ids & a list of items without Item Ids. Order is placed via API call to Shop Service with Items having Item Ids. Once the shop returns a response, list of order confirmations from shop is merged with list of items without Item Ids. The complete list is then sent back to the user.

> vs.

>> You send your shopping list to our API, it checks with catalog for available items. Order is placed to our shop with the items which were found in the system. Finally the complete list of items ordered in shop and items not found in shop are returned to user with proper status message.
