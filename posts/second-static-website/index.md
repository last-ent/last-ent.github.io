<!--
.. title: Second Static Website
.. slug: second-static-website
.. date: 2020-11-03 23:56:24 UTC+01:00
.. tags:  off-topic
.. category: 
.. link: 
.. description: How to host static website using Netlify as alternative to Github Pages. Artisanal Static Website with Clean URLs or Pretty URLs. Sneak Peek to Easy Zettel.
.. type: text
-->


# Static Website Hosting

I really like the low footprint and utility of Static Websites. This website is built using `Nikola`.

In this post I will talk about some issues I faced with deploying a second static website and how I eventually solved it.

## Github Pages
I have long enjoyed the awesomeness of `User Github Pages` and am quite happy with it.

However as soon as I tried to create a second independent static website with custom domain, `Github` was having nothing of it.

After spending lot of time scouring the web for how to make it work between `Github` & `Namecheap`, my DNS provider, I had nothing to show for it.

{{% otprompt %}}

## Netlify
Finally got around to having a look at `Netlify` and I must say it works great!

It took me a while to understand how to deploy a simple HTML page as I am used to working with tools like `Nikola` or `Hugo`.

# Artisanal Static Website
In case you want to handroll a static website with pure HTML pages, then here's the trick.

## Clean URLs
If you want `Clent/Pretty URLS` then for each pages you need to have it in a separate sub-directory along with an `index.html` file.

Let's look at an example:

In case you want to have a site with following URLs:

- `/`
- `/first`
- `/second`
- `/with-children`
- `/with-children/nested1`
- `/with-children/nested2`

## Directory Structure
Then you need to arrange your HTML pages in following order.
```text
root
├── index.html
├── first
│   └── index.html
├── second
│   └── index.html
└── with-children
    ├── index.html
    ├── nested1
    │   └── index.html
    └── nested2
        └── index.html
```

Note that `root` will point to `/` folder.

{{% promptend %}}

# My New Site

You might be wondering what is this new site I have been playing around with.

It's called [Easy Zettel](//www.easy-zettel.com) and I briefly touched on it in my post [Mapping Thoughts](https://last-ent.com/posts/mapping-thoughts/)

I am working on this as a fun experiment and I intend to write in greater detail about it soon.
