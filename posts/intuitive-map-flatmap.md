<!--
.. title: FP for Sceptics: Intuitive guide to map/flatmap
.. slug: intuitive-map-flatmap
.. date: 2020-11-19 19:03:25 UTC+01:00
.. tags: software design, functional programming, programming, FP for sceptics
.. category: 
.. link: 
.. description: Intuitive guide to learning map/flatmap. Language agnostic way to understand map/flatmap. This is part of my ongoing series, FP for Sceptics.
.. type: text
-->

# Backbone of Functional Programming

`map` & `flatmap` form the backbone of Functional Progamming. It is very important be comfortable with these two concepts and this guide will help you develop an intuition for them.

This guide is language agnostic but I expect you to be familiar with basic programming concepts like functions, types, data type/objects and list. 

## Nomenclature

Let me introduce you to some basic terms we will be using to talk about `map/flatmap`.

* `Type`s are data constructs and they can be `Basic Types` like Int, String etc.
* `Container` is a special `type` which contains another `type`. For example a List of Ints.
* `Function` is a function whose input is of Type 1 and output is of Type 2. Type 1 & Type 2 can be same type.

## Visualize
Though I have defined three terms it will be easier to think about them visually.

`Basic types` (Int, String etc) will be represented by shapes ![Triangle](./images/fmap/up-t.png) & ![Reverse Triangle](./images/fmap/rev-t.png).

`Containers` will be represented by shapes ![Empty Square](./images/fmap/0-sq.png) & ![Empty Circle](./images/fmap/0-crl.png).

In reality, we will always talk about Container for a type so ![Square for Triangle](./images/fmap/t-sq.png), ![Circle for Reversed Triangle](./images/fmap/rev-t-crl.png), etc.

`Functions` will be denoted as ![f : Triangle -> Star](./images/fmap/fcn.png)


### Verbalize
Let's see how to verbalize these terms:

![Square for Triangle](./images/fmap/t-sq.png) -> Container for Triangle

![Square for Circle for Triangle](./images/fmap/t-crl-sq.png) -> Square for Circle for Triangle

![f : Triangle -> Star](./images/fmap/fcn.png) -> `f` is a function from Triangle to Star

![g : Triangle -> Square for Triangle](./images/fmap/g-fcn.png) -> `g` is a function from Triangle to Container of Triangle


# Fundamentals

In this section, I want to introduce one basic concept along with `map/flatmap`.

## Function Composition 

> `Function Composition` is chaining two or more functions such that output of one function feeds into to the input of second function and so on.

![f : Triangle -> Star](./images/fmap/fcn.png)

![g : Star -> Container of Reverse Triangle](./images/fmap/g-revc.png)

![g . f : Triangle to Container of Reverse Triangle](./images/fmap/gof-derive.png)


## `map`

> `map` is a function that takes a Container (C1) & a Function (F) as input and returns a new Container (C2) for Function's (F) output type.

![map : (f : Triangle -> Reverse Triangle, Container for Triangle) -> Container for Reverse Triangle](./images/fmap/map.png)

### Rules for `map`
> - Type contained by Container (C1) has to match Function's (F) input type.

## `flatmap`
> `flatmap` is a function that takes a Container (C1) & a Function (F) as input and returns a new Container (C2) for Function's (F) output type.

### Rules for `flatmap`
> - Type contained by Container (C1) has to match Function's (F) input type.
> - Function (F) has to return a Container (C2)
> - C1 == C2. This is very important to remember as many people trip up on this.

![flatmap : (f : Triangle -> Container for Reverse Triangle, Container for Triangle) -> Container for Reverse Triangle](./images/fmap/flatmap.png)

> **Note**: As you can see, both `map` & `flatmap` have the same written definition but the strictness is in the rules it has to adhere to.

# Exercise Problems
Let's conclude with a few exercise problems.

![Problem Set: Map](./images/fmap/map-problems.png)

![Problem Set: FlatMap](./images/fmap/flatmap-problems.png)

![Problem Set: Advanced Flatmap](./images/fmap/adv-flatmap-problems.png)

# Conclusion

I hope after going through this guide, you are more comfortable working with `map/flatmap`.

If you liked this guide, have a look at the rest of my posts on FP (in Scala) - [FP for Sceptics](/categories/fp-for-sceptics/)