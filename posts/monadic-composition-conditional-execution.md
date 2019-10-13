<!--
.. title: Monadic Composition & Conditional Execution
.. slug: monadic-composition-conditional-execution
.. date: 2019-10-12 20:44:04 UTC+02:00
.. tags:
.. category:
.. link:
.. description:
.. type: text
.. status: draft
-->

- [Introduction](#introduction)
- [Challenge](#challenge)
  - [Conventions](#conventions)
  - [The power of `Cats`](#the-power-of-cats)
    - [`Either`](#either)
    - [`EitherT`](#eithert)
- [Donatron](#donatron)
  - [Specification](#specification)
    - [Expected Flow](#expected-flow)
    - [Interface](#interface)
    - [Additional Information](#additional-information)
    - [Faulty Composition](#faulty-composition)
    - [Tests](#tests)
  - [Monadic Composition with `EitherT`](#monadic-composition-with-eithert)
    - [Understanding `trait RawData`](#understanding-trait-rawdata)
    - [Transforming `F[A] => EitherT[F, RawData, A]`](#transforming-fa--eithertf-rawdata-a)
    - [Composing `EitherT` in `Donatron.donate`](#composing-eithert-in-donatrondonate)
- [Conclusion](#conclusion)
  - [Complete Code](#complete-code)

# Introduction

We have been using FP/Scala in our team for quite a while now and as is to be expected, we keep coming across interesting challenges due to our earlier design decisions which no longer fit in with our current mode of thinking and/or requirements.

# Challenge

> If all steps need to be executed and the return type is the final step, using `for comprehension` or `chaining flatmaps` works well. 
> 
> What can we do to ensure some steps are executed conditionally while other steps are executed regardless of intermediate steps?

## Conventions

Before I dig into how we solved it, let me describe some of our code design decisions:

- Tagless Final approach, `F[_]`
- Effects centered around `Cats` & `Cats Effect`
- Raise error on invalid state or on reaching unhappy path ie., `Effect[F].raiseError`
- Handle said errors using `Effect[F].handleErrorWith`

This has been a useful paradigm for past 2 years but does not work in the face of the new challenge. The reason is that raising error on invalid state was acceptable as long as we sent proper response.

However we now need to log state at different points of code execution. Some states needed to be logged at all costs, while few other states would only be reached if no errors raised.

## The power of `Cats`

`Typelevel's Cats` provides many useful constructs and it did not disappoint us. It was straightforward to design a solution that would work with existing code while giving us all the flexibility in the world. But first, it's important to understand where to use `Either` & `EitherT`.

### `Either`

> `Either` is right biased in `Scala` & `Cats`. This means that if we can `map` or `flatmap` our functions and all of them return the same Monad (`Either` here) then we can chain or, `compose` our functions. This also means that next function in the chain will only be executed if the current function returned a value of type `Right[A]`. This is perfect if you want `A => D` and you have functions that go from `A => Either[E, B]`, `B => Either[E, C]` & `C => Either[E, D]`.

### `EitherT`

> In our case, `Either` doesn't work since most of our code is of the form, `A => F[B]`, `B => F[C]` & `C => F[D]`. Enter `EitherT`! Functions need to be transformed to `A => EitherT[F, E, B]`, `B => EitherT[F, E, C]` & `C => EitherT[F, E, D]`. 

Let's use an example.

# Donatron

You need to create an awesome system that accepts donations while following the specification.

## Specification

### Expected Flow

![Expected flow of Donatron](/images/donatron-flow.png)

### Interface

```scala
class Donatron[F[_]: Effect]() {
  def donate(req: Request): F[Response] = ???

  def checkForValidInts(req: Request): F[ValidIntsFound] = ???

  def checkForMinimumLength(data: ValidIntsFound): F[IntsAboveMinimumFound] = ???

  // Call to external system and might raise error
  def submitDonations(data: IntsAboveMinimumFound): F[AcceptedDonations] = ???

  def logAndReturnResponse(data: RawData): F[Response] =
    logResponse(data) >> Effect[F].delay(data.toResponse)

  def logResponse(data: RawData): F[Unit] =
    Effect[F].delay(println(s"Response: ${data.toLogMessage}"))

  def logAndReturnAcceptedDonations(donations: AcceptedDonations): F[AcceptedDonations] =
    Effect[F]
      .delay(println(s"Valid Donations: ${donations.toLogMessage}"))
      .map(_ => donations)
}
```
### Additional Information

* As long as the system doesn't throw `RuntimeException`, we should log the data & return response as a standardized string
* The system should log
    * Response returned
    * Accepted donations, if call to another system was successful

### Faulty Composition

Our challenge begins here:

```scala
def donate(req: Request): F[Response] =
  checkForValidInts(req)
    .flatMap(checkForMinimumLength)
    .flatMap(submitDonations)
    .flatMap(logAndReturnAcceptedDonations) // Should only be executed if submitDonations was successful
    .flatMap(logAndReturnResponse) // Should be executed regardless of prior steps
```

As hinted in the comments, this code is "almost" correct but doesn't satisfy the complete specification as expected because the flow is as follows:

![Faulty Flow](/images/donatron-faulty-flow.png)

The code details can be found here - [Donatron(branch: faulty-composition) :: Donatron.scala](https://github.com/last-ent/donatron/blob/faulty-composition/src/main/scala/donatron/Donatron.scala)

### Tests

Based on the specification, we can define following tests [Donatron(branch: faulty-composition) :: DonatronSpec.scala](https://github.com/last-ent/donatron/blob/faulty-composition/src/test/scala/donatron/DonatronSpec.scala)

* `Response message when Request has valid ints between 10 & 10k`
* `Response message when Request has few invalid ints`
* `Response message when Request has few valid ints less than 10`
* `NoValidInts message when Request has no valid ints`
* `NoValuesAboveMinimum message when Request only has valid ints less than 10`
* `Exception when Request has valid ints greater than 10k`

We can test the correctness of our implementation by running these tests. If they are run right now, two test cases will fail:

* `NoValuesAboveMinimum message when Request only has valid ints less than 10`
* `NoValidInts message when Request has no valid ints`

## Monadic Composition with `EitherT`


### Understanding `trait RawData`

### Transforming `F[A] => EitherT[F, RawData, A]`

### Composing `EitherT` in `Donatron.donate`

# Conclusion

## Complete Code