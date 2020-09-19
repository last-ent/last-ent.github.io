<!--
.. title: Visual guide to polling in Functional Programming (Scala)
.. slug: polling-in-fp
.. date: 2020-07-26 17:55:41 UTC+02:00
.. tags: software design, functional programming, programming, scala,
.. category: 
.. link: 
.. description: Visual guide to reason about using fs2 streams, especially for polling an API with rate limits.
.. type: text
.. previewimage: /images/poll-st-3.png
-->

In this post, let's look at how to poll a system using a Stream.

To make it easier/interesting, I will explain it using a visual approach.

Let's use the following problem statement.

- We have API for a queue[^0] that can be queried using `pollFn` function.
- We need to process data returned by queue using `process` function.
- There may or may not be data at the time of querying.
<!-- TEASER_END -->
- We need to continually query the API to see if any new data is available.
- It is possible to run into rate limiting issues.
- The data processing isn't time critical, so we can query after wide intervals of time (1 minute).

_This post assumes you understand fs2 streams._

_I intend to write about fs2 streams later on but for now have a look at [fs2 Streams Guide](https://fs2.io/guide.html)_

# Visualising the problem
Let's start by visualising what we want to build.

![1](/images/poll-to-fs2-flow2.png) We know that `pollFn` function will call `process` function.

![2](/images/poll-to-fs2-loop.png) Next we want to repeatedly call this function to check for fresh data.

![3](/images/poll-to-fs2-wait-loop.png) To avoid being rate limited we can query the API every 1 minute.


Now that we have visualised the problem, let's try to implement it. We will first implement it using imperative programming and then using streams, which will be the more functional way of doing it.

{{% promptmid %}}

# Implementation: Imperative Scala

```scala
// Basic functions
def pollFn(): Option[Int] = ???
def process(dataOpt: Option[Int]): Unit = ???

// Single call
def singlePoll() = {
  val dataOpt = pollFn()
  process(dataOpt)
}

// Repeated calls spaced for every 1 minute
def continuousPoll() = {
  while (true) {
    val dataOpt = pollFn()
    process(dataOpt)
    Thread.sleep(1000 * 60) // 60 * 1000 milliseconds or 1 minute
  }
}
```

The code in `continuousPoll` is pretty straightforward.

Three lines to _poll_, _process_ & _wait_. A fourth to _run it in a loop_.

It also looks quite similar to the third diagram shown at beginning.

# Implementation: FS2 Streams
Now let's implement it using `fs2`.

```scala
import fs2.Stream
import cats.effect.IO
import cats.syntax.functor._

import cats.syntax.flatMap._
import scala.concurrent.duration._
import cats.effect.Timer

import scala.concurrent.ExecutionContext
implicit val timer = IO.timer(ExecutionContext.global)

// I have replaced pollFn with a Stream version pollStream.
// I will cover how to convert normal or IO functions into fs2 streams separately.
// For the sake of this example, I am using a predefined stream.
def pollStream(): Stream[IO, Int] =
  Stream.emits(List(1, 2, 3, 4)) ++ Stream.empty ++ Stream.emit(100)

def processInt(data: Int): IO[Unit] = IO.delay(println(data))

def pollStreamForever(): Stream[IO, Int] =
  pollStream()
    .evalTap(processInt)
    .metered(1.minute)
    .repeat

val result =
  pollStreamForever()
    .take(5)
    .compile
    .toList
    .unsafeRunSync

result == List(1,2,3,4,100)
```

At first glance, it might seem like the imperative version of poll is better, because it consists of four lines of code and code will be familiar to both FP style & imperative style of programmers.

I admit that the FP/Stream version of code will be a bit hard for those who aren't already used to these concepts[^1].

# Visualising Streams

Before we jump to conclusions, let's try to visualize what the code is doing to see if this might improve our intuition of the code.

We will start with the basic stream `pollStream` and build upon it by adding each stream function and looking at how it modifies the stream.


---

## Visualization 1

![Visualizing fs2 code 1](/images/poll-st-1.png)

> * `pollStream` is a stream of `Int`s.

---

## Visualization 2

![Visualizing fs2 code 2](/images/poll-st-2.png)

> * `pollStream.evalTap` is a stream of `Int`s after being processed via `evalTap`.

***

## Visualization 3

![Visualizing fs2 code 3](/images/poll-st-3.png)

> * `pollStream.evalTap.metered` is a stream of `Int`s after being processed via `evalTap`.
> * Now the Ints are spaced apart by a minute.
___

## Visualization 4

![Visualizing fs2 code 4](/images/poll-st-4.png)

> * `pollStream.evalTap.metered` is a stream of `Int`s after being processed via `evalTap`.
> * Now the Ints are spaced apart by a minute.
> * The stream will restart after it comes to an end.

# Testing

Imperative code doesn't give us a straightforward way to extract values out of the infinite loop without relying upon hacks.

Stream makes it easy to extract the result for testing as shown by `result` function definition.

{{% promptend %}}

# Conclusion

Hopefully this post gave you an idea on how to turn a polling function into a fs2 stream and how to test a stream.

{{% promptbook %}}


[^0]: I was dealing with Amazon SQS but for this example I am adding extra constraints to make it more interesting and easier to gr0k.

[^1]: See [https://fs2.io/guide.html](https://fs2.io/guide.html)