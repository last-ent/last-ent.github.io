<!--
.. title: Continuous Polling in Functional Programming (Scala)
.. slug: polling-in-fp
.. date: 2020-07-03 17:55:41 UTC+02:00
.. tags: 
.. category: 
.. link: 
.. description: 
.. type: text
-->

<!-- 
In this post we are going to see how a block of code that needs to be looped ad-infinitum can be turned into a Stream easily. -->

In this post, let's look at how to poll a system using a Stream.

Let's use the following problem statement.

- We have API for a queue[^0] that can be queried for data.
- There may or may not be data at the time of querying.
- We need to continually query the API to see if any new data is available.
- It is possible to run into rate limiting issues.
- The data processing isn't time critical, so we can query after wide intervals of time (1 minute).

Let's figure out the major functions required.

@comment: Let's abstract away the API to be queried as function `pollFn` & data processing can be abstracted by fuction `process`
```diagram
pollFn -> process
```

@comment: Next we want to repeatedly call this function to check for fresh data.
```diagram
pollFn <-> process
```

@comment: We want to avoid being rate limited and we can get away with querying the API every 1 minute.
```diagram
pollFn -> process -> wait 1 min -> pollFn() ...
```
Now that we have a clear idea of what we want to implement, let's start by implementing it in imperative Scala.

```scala
// Basic functions
def pollFn(): Option[Int] = ???
def process(dataOpt: Option[Int]): Unit = ???

// Single call
def singlePoll() = {
  val data = pollFn()
  process(data)
}

// Repeated calls spaced for every 1 minute
def continuousPoll() = {
  while (true) {
    val data = pollFn()
    process(data)
    Thread.sleep(1000 * 60) // 60 * 1000 milliseconds or 1 minute
  }
}
```

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
// For the sake of this example, I am using a predefined stream.
def pollStream(): Stream[IO, Int] =
  Stream.emits(List(1, 2, 3, 4)) ++ Stream.empty ++ Stream.emit(100)

def processInt(data: Int): IO[Unit] = IO.delay(println(data)) >> IO.unit

def pollStreamForever(): Stream[IO, Int] =
  pollStream()
    .evalTap(processInt)
    .metered(1.seconds)
    .repeat

val result =
  pollStreamForever()
    .take(5)
    .compile
    .toList
    .unsafeRunSync

result == List(1,2,3,4,100)
```

On first glance, it might seem like the imperative version of poll might be better because it consists of four lines of code and code will be familiar to both FP style & imperative style of programmers.

I admit that the FP/Stream version of code will be a bit hard for those who aren't already used to these concepts but *there is hope*[^1]. 

Having said that, there is an important factor to consider for all code we write

> How are we going to **test** the code?

In case of imperative code, we don't have any straightforward to extract values out of the infinite loop without relying upon hacks.

However in case of the Stream, we are able to extract the result and check.

# Conclusion

Hopefully you can see the advantage of Streams and how it can be used in a practical scenario for more testable and clearer code. Also as we already saw[^1] there are quite a lot of interesting ways we can manipulate the stream which are not available if we use a normal loop.


[^0]: I was dealing with Amazon SQS. I am adding some extra constraints not application to SQS to make the list of constraints easier to gr0k.

[^1]: Hopefully [Quick intro to FS2 Streams](#) removes this obstacle.