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

We use a Kanban/Agile mix methodology in our projects and we came across on an interesting problem when implementing a new feature. Rather than trying to explain it in vague terms, I am going to tell a story which is in the same spirit.

## Story

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

#### Some of them even forgot that the goal of building these blocks was to combine them at the end!

## Why did this happen?
I am sure that everyone has faced this problem at some point in their career. Feature/User Story gets broken down into small tickets and then developers pick up individual tickets to implement them. The expected result is that at the end they will all fit together. This happens because developers need to narrow their focus so that they can implement the ticket to the best of their ability. However the drawback is that the holistic view is lost and it is very easy to not realize how a minor change can impact the overall feature.

## How can we fix this?
We can use Type Driven Development to ensure this doesn't happen again. Let's first look at what we mean by Type Driven Development.

> Type Driven Development: Define the behaviour in terms of:

> * Components (Function Types)

> * Domain models (Data Types).

Once these specifications are in place, everyone can branch out to implement their individual tasks.

If we take the example of our four blocks, we can specify the behaviour and components using the block colours, pegs & holes of the four blocks and how they all connect together.

![Pegs & holes of the four blocks is defined along with how they are connected. Rest of the block is missing.](/images/glue-code.jpg)

Now each of the apprentices can use the block's skeleton to create his/her own block as (s)he knows the size, colour and position of peg & hole.

## What does this look like in code?
An important point to keep in mind is that this is not a document but living code! Good news is that we don't need to use a formal specification system like TLA+ or Coq to but use plain old types and/or interfaces. 

![Shopping process](/images/shopping.png)
