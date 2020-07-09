<!--
.. title: Continuous Polling in Functional Programming (Scala)
.. slug: polling-in-fp
.. date: 2020-07-03 17:55:41 UTC+02:00
.. tags: 
.. category: 
.. link: 
.. description: 
.. type: text
.. status: draft
-->

In this post, let's look at how to poll a system using a Stream.

Let's use the following problem statement.

- We have API for a queue[^0] that can be queried using `pollFn` function.
- We need to process data returned by queue using `process` function.
- There may or may not be data at the time of querying.
- We need to continually query the API to see if any new data is available.
- It is possible to run into rate limiting issues.
- The data processing isn't time critical, so we can query after wide intervals of time (1 minute).

{{% promptmid %}}

_This post assumes you understand fs2 streams. I intend to write about fs2 streams later on but for now have a look at [fs2 Streams Guide](https://fs2.io/guide.html)_

Let's start by understanding what we want to build.

![1](/images/poll-to-fs2-flow2.png) We know that `pollFn` function will call `process` function.

![2](/images/poll-to-fs2-loop.png) Next we want to repeatedly call this function to check for fresh data.

![3](/images/poll-to-fs2-wait-loop.png) We want to avoid being rate limited and we can get away with querying the API every 1 minute.

Now that we have a clear idea of what we want to implement, let's start by implementing it in imperative Scala.

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

The code in `continuousPoll` is pretty straightforward. Three lines to poll, process & wait while a fourth to run it in a loop.

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

Having said that, there is an important factor to consider for all code we write

> How are we going to **test** the code?

In case of imperative code, we don't have any straightforward to extract values out of the infinite loop without relying upon hacks.

However, with the Stream we are able to extract the result for testing as shown in the code above which is pretty straightforward.

{{% promptend %}}

# Conclusion

Hopefully you can see the advantage of Streams and how it can be used in a practical scenario for more testable and clearer code. Also as we already saw[^1] there are quite a lot of interesting ways we can manipulate the stream which are not available if we use a normal loop.

{{% promptbook %}}


[^0]: I was dealing with Amazon SQS but for this example I am adding extra constraints to make it more interesting and easier to gr0k.

[^1]: See (https://fs2.io/guide.html)[https://fs2.io/guide.html]