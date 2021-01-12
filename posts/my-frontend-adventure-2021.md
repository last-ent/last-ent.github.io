<!--
.. title: My Frontend Adventure (2021)
.. slug: my-frontend-adventure-2021
.. date: 2021-01-13 00:15:05 UTC+01:00
.. tags: frontend, nightmare, from-scratch
.. category: 
.. link: 
.. description: What is the best way to get started with Frontend development in 2021? Brief summary of what I found and what I intend to do next.
.. type: text
-->

# What is the best way to get started with Frontend development in 2021?

Every time I start looking at the current state of Frontend tools it starts to freak me out.

## The start

I decided to bite the bullet and VueJS felt alluring.

```
$ npx create-vue-app
```

> Lo & Behold! I have an app with has around **100+ vulnerabilities.**

I try to update and `--force` update the deps and I still have **70 vulnerabilities left**.

I will be honest with you, it does not feel good to create a fresh app with so many issues preinstalled.

## What did I do next?

```
$ rm -rf my-vue-app
```

No point in using it.

## So how do you develop a Frontend app in 2021?

I decided to **go back to basics**

I am gonna try and create one from scratch and run with it.
I think my needs are _simple enough. (famous last words)_

- Create static html pages
- Minify my html & JS where possible
- Package it into a neat folder/zip file
- Test any and all code I might have
- Ajax interactivity.

Maybe it IS too much to ask or maybe it isn't.

I did some quick look about and I check out following tools:

- `npm scripts` as build system
- `Bulma` for lightweight CSS styling
- `Jest` for testing code
- `UmbrellaJS` for jquery-like interactivity & helpers
- `Babel`/`Typescript` for sane default language. I want to use a statically typed language if I can, would make life easier.

So that's about it!

If I ever go down this path, I will keep you posted on how I fared.
