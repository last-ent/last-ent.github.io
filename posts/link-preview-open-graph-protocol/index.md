<!--
.. title: Link Preview & Open Graph Protocol
.. slug: link-preview-open-graph-protocol
.. date: 2021-01-19 20:00:45 UTC+01:00
.. tags: 
.. category: 
.. link: 
.. description: 
.. type: text
-->

Notice how on posting a link on some sites or some messenger apps, a link preview shows up?

One might think the site/app crawls the webpage for this information but that's not the case. There is lot more interesting tech at play here.

Simply put

> Open Graph Protocol

Let's take a deeper look and answer three questions

1. What is Open Graph Protocol?
2. How can I create custom link previews?
3. Can I create dynamic link previews?

{{% promptmid %}}

# Open Graph Protocol

> What is Open Graph Protocol?

Open Graph Protocol or `OGP` for short, was developed by Facebook for their website and as a universal standard to be used across the web.

This makes sense for Facebook; Otherwise the posts on the site would look quite drab. Thanks to `OGP` being an open standard designed to work with standard HTML it is easy to adopt for everyone and makes for interesting web links.

## In a nutshell

The standard is pretty straightforward and can be found at [https://ogp.me/](https://ogp.me/).

For writing articles/blog posts the protocol is even smaller.

> It all starts with `<meta>` tags.

Standard HTML has three main components

- `<html> ... </html>` tag which beings and ends a web page
- `<head> ... </head>` tag which contains all metadata for the web page
- `<body> ... </body>` tag which contains the actual content shown in browser

`head` & `body` are nested inside `html` tag

```html

<html>
	<head>
		....
	</head>
	<body>
		...
	</body>
</html>
```

Though `<head> ... </head>` is supposed to contain all metadata for the web page, the official way to add metadata to 

According to the standard, the official way to add metadata to an HTML web page is by adding `<meta>` tags to `<head> ... </head>` section.

### Required properties

According to `OGP` standard, the absolute minimum required for a web page[^1] are

- `og:title` => Used as title of thumbnail
- `og:type` => Defines the type of webpage/"object". This can imply other fields are also required.
- `og:image` => Used for picture of thumbnail
- `og:url` => Canonical URL to be used as permanent ID.

### Useful (optional) properties

We can also add other properties to further enrich the webpage metadata but two stand out that (IMO) are worth mentioning.

- `og:description` - One or two sentence description of the object
- `og:site_name` - If you have subdomains but want to show standard site name.

### Blog Page Source

If you view the source of this page, you will find following tags
```html
<html prefix="og: http://ogp.me/ns# article: http://ogp.me/ns/article# " lang="en">
<head>
	<meta name="author" content="Ent">
	<meta property="og:site_name" content="Last Ent's Thoughts">
	<meta property="og:title" content="Link Preview &amp; Open Graph Protocol">
	<meta property="og:url" content="https://last-ent.com/posts/link-preview-open-graph-protocol/">
	<meta property="og:description" content="...">
	<meta property="og:type" content="article">
	<meta property="article:published_time" content="2021-01-19T20:00:45+01:00">
</head>

```

## Custom Link Previews

> How can I create custom link previews? 

You create custom link previews in two simple steps:

1. Adding `prefix` property to `html` tag
2. Adding required Open Graph `<meta>` tags (minimum)

### Demo

If you look at [https://last-ent.com/ogp-demo.html](https://last-ent.com/ogp-demo.html), you would see something like this

![H1 Header: You should check the page source for interesting stuff.](/images/ogp-hello.png)

### Link Preview
But link preview will show something else

![Link preview shows the meta from page source](/images/ogp-hello.png)

### Page Source

Code for the link preview is in the `head` and you can see the `body` as well.

```html
<html prefix="og: http://ogp.me/ns# article: http://ogp.me/ns/article# " lang="en">
<head>
	<meta name="author" content="Ent">
	<meta property="og:site_name" content="Last Ent's Thoughts">
	<meta property="og:title" content="Open Graph Protocol Demo">
	<meta property="og:url" content="https://last-ent.com/ogp-demo.html">
	<meta property="og:description" content="View Page Source to see how to create these previews.">
	<meta property="og:type" content="article">
	<meta property="article:published_time" content="2021-01-19T20:00:45+01:00">
</head>
<body>

  <h1> You should check the page source for interesting stuff.</h1>

</body>
</html>
```

_If you don't know what `<html prefix="...">` is about, read on._

## Object Type

Object Type defines the kind of web resource the URL links to.

```html
<meta property="og:type" content="XYZ" />
```

There are standard types and user-defined types. Before object types can be used, they have to defined in the namespace.

```html
 <head prefix="my_namespace: https://example.com/ns#">
 <meta property="og:type" content="my_namespace:my_type" />
```

Object types can be grouped into "verticals". `OGP` namespace gives us a few to start with:

- Music
- Video
- No Vertical: _These don't have a neat category but are useful._
	- article
	- book
	- profile
	- website. _This is the default if none of the others apply but still has to be added manually._

# Dynamic Link Previews

> Can I create dynamic link previews?

The answer depends on whether we are dealing with static website or a server side rendered website.

*Server side rendered website*: When a link is requested, the server can inject any dynamic content it wants before sending the response, hence it is possible to have dynamic links.

*Static Websites*: OTOH, static web pages would have to use JavaScript to add dynamic `<meta>` tags. Open Graph consumers are very unlikely to execute JavaScript as it serves no purpose. Hence Static websites can't have dynamic link previews.

{{% promptend %}}

# Conclusion

Hope you found this post useful and have better understanding of the marvels of modern web.


[^1]: *As per Facebook*. Likely required for a web url to be registered by Facebook as a "graph object". I cannot comment (yet) on whether this is required by other services using the protocol.
