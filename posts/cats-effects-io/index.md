<!--
.. title: Cats Effect's IO
.. slug: cats-effects-io
.. date: 2019-08-12 20:44:38 UTC+02:00
.. tags: programming, scala
.. category: 
.. link: 
.. description: 
.. type: text
-->

Cats Effect's Fibers/IOs run on a thread pool created over VM. They are essentially Green Threads that are created over the thread pool. Unlike async frameworks, IO.flatmaps does not include _asynchronous boundary. This means that essentially all of nested flatmaps are run within a single fiber. IO has mechanism to introduce asynchronous boundary but this has to be done manually by the developer via IO.shift. Operations such as race, parMapN or parTraverse inherently introduce asynchronous boundary.

~ 14th May, 22:11
