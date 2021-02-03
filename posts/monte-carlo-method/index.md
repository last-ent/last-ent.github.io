<!--
.. title: Monte Carlo Method
.. slug: monte-carlo-method
.. date: 2021-02-03 22:51:04 UTC+01:00
.. tags: Probability, Computer Science
.. category: 
.. link: 
.. description: Ever wondering what is meant by Markov Chain & Monte Carlo methods? In this post, I take a quick look at these two topics.
.. type: text
-->

In this essay I will talk about a term you might've come across when reading scientific literature or research papers. Idea is to develop gut feeling (intuition) for what the text is saying when **Monte Carlo Method** is mentioned.

# Prerequisites

**Monte Carlo Method (MCm)** builds on top of other topics and concepts, taking time to understand them will make learning about **MCm** quite easy.

1. Randomness in computers
2. Law of Large Numbers
3. System or Process Model
4. Probability Distribution (Function)
5. Deterministic Computation (Function)
6. Markov Chain


## Randomness in Computers

Random numbers generated in computers are not truly random but are "pseudo-random". True randomness is hard to implement in computers and in many cases not even desirable.

Randomness in computers is useful when we want to remove predictability from a sequence or program. This means two things

- No predictable pattern to numbers generated
- Mathematically proven the generated "random numbers" are indeed random.

The two criteria might seem to contradictory but what this means is

> The pattern of random numbers generated should be unpredictable for layperson and be computationally impossible to *crack* (predict).


Truth is we want the ability to recreate the random number sequence, this comes in handy when we want to test or debug an algorithm. For this reason these pseudo-random generators take a **seed value**. This way we can create a repeatable pseudo-random sequence.

*Note: It is possible to create pseudo-random numbers. Such generators rely upon random events such as user input.*

## Law of Large Numbers

Scientific experiments are conducted multiple times before the results are published because there can be mistakes or error in measurements made during the experiment. These errors can lead to incorrect conclusion being made.

Turns out that if we are able to conduct an experiment multiple times and aggregate[^1] the results, the margin of error drop down to zero[^2]. 

Put another way

> The probability or accuracy of an experiment will increase with greater iteration of the experiment.

## System or Process Model

In science & engineering we try to define a mathematical model of a phenomenon/system using a set of values to describe it's current state, future state and what caused changed in the state via different sets of values.

That is, we can use a model to describe the state of a system in terms of given input of values vs. expected output of values.

## Probability Distribution (Function)

If we can define a process as a set of values that have been measured or observed over time:

> For this defined domain of values, in a Probability Distribution, each value has equal likelihood of being picked up.

## Deterministic Computation (Function)

> Computation or function that will return same output for same input values.

_Note: In Mathematics or Functional Programming, this is same as a Pure Function._


## Markov Chain

**System or Process Model** can have internal states that are dependent on one another. It can also have output states that can be used as input for next iteration.

Markov Chain is one method to define such a system in terms of states and transitions ie., how it moves from one state to next.

### Markov Property
A system is a Markov chain IFF[^3] the transition to next state does not depend on current state ie., it is "*Memoryless*".

# Monte Carlo Method (MCm)

Goal of Monte Carlo Method is to use experimentation or simulations to predict the outcome of a system with greatest accuracy possible.

**MCm** has a specific process:

- Runs the same experiment multiple times
- Over a small sample of random inputs
- Averages these Outputs for most probable outcome

Put another way[^4] 

- Define a domain of possible Inputs
- Use **Probability Distribution** over the domain to select random Inputs
- Perform **Deterministic Computations**
- Aggregate the results which should give us an accurate prediction of output based on **Law of Large Numbers**

## Markov Chain Monte Carlo Method

> Markov Chain Monte Carlo method uses a random set of values generated from a markov chain as inputs for Markov Chain Method/Simulation.

[^1]: Most common is averaging the results.

[^2]: Imagine you have 10 readings and actual value is 5. But you have values greater than actual value - 6 (5+1), 7 (5+2) & 8 (5+3). Similarly you have values less than actual value - 4 (5-1), 3 (5-2) & 2 (5-3). If you average these out, you will get 5 as the answer. Of course, in practice things aren't going to be this simple but this should give you an idea.

[^3]: If and only if 

[^4]: Taken from Wiki
