<!--
.. title: Pure, Impure & (Side) Effects
.. slug: pure-impure-side-effects
.. date: 2020-07-04 00:53:48 UTC+02:00
.. tags: 
.. category: 
.. link: 
.. description: 
.. type: text
-->

The more you hang out in Functinal Programming (FP) world, the more you will start to come across terms that are never explained but assumed to be already known by the reader[^0]. 

In this post I want to discuss some of these so that it will be easier to follow my upcoming posts.

# Pure Functions

Consider a function that adds to numbers

`def add(x: Int, y: Int): Int = x + y`

As long as you give this function valid `Int`s, it will always return the same value back. The function is not affected by time of day or position of stars or any other eternal factors. Such functions are called "Pure Functions":

> **Pure Functions** are self contained functions whose results are affected by external factors. For the same set of inputs, they will always return the same set of outputs.

#  Impure Functions

Your first reaction might be, "Well that makes sense. That's what I expect functions to do." Truth is that we use a lot of functions that aren't "Pure Functions".

Let's start with the simplest example, consider `System.currentTimeMillis()`.

Everytime you call this function, it is going to return a different value because _clock is ticking._

Another example would be things like making an HTTP call, you may get back requested data but it is also possbile to get any of the HTTP Error or even network level errors. These things are not under your control and they can affect the result.

> **Impure Functions** are functions that can return different results for same set of inputs. This is because they are dependent on external factors.

## How to deal with `Impure Functions`?

Now that we have established what Impure Functions are. The next question to ask is:

> How does Mathematics or Type Theory handle these impure functions?

One of the ideas behind using FP in programming is to make reasoning about our system predictable. But Impure Functions, by their very definition, are introducing unpredicatbility in our system!

In order to deal with this FP introduces, what for now I will call, _Contextual Containers_[^1].

_Contextual Container_ contains a value we want to work with. There are a few rules to work with it:

- _Contextual Container_ accepts one or more types just like `List`, `Option`, `Either` or other such types.
- If you have an impure function, wrap it within another function that return _Contextual Container_.
- A function that returns a _Contextual Container_ can return different values for same set of inputs; Because of the "context" _Contextual Container_ is working within.
- Result of a _Contextual Container_ should always be another _Contextual Container_.
- If you are extracting value out of your _Contextual Container_ to continue coding, *then you are doing something wrong*.

For the remainder of this post, I will be referring to _Contextual Container_ as `IO`[2].

Consider `System.currentTimeMillis`, this is an impure function. In order 




[^0]: This makes sense if you think about it. Imagine watching a Football or Tennis match where the rules are explained at beginner level everytime you watch them; While I appreciated them at the start, they began to feel silly over time.

[^1]: I am talking about `Monads` of course! But discussion of `Monad` requires talking of the laws and other interesting details. My goal here is to provide a simpler abstraction and for developers coming from web API world, it will be easier to relate if they think in terms of "Context" object.

[^2]: I will also be covering `Cats Effect IO` later in this chapter. But until then, `IO` should be translated as _Contextual Container_.