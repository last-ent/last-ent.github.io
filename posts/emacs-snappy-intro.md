<!--
.. title: Ent's snappy guide to Emacs
.. slug: emacs-snappy-intro
.. date: 2020-11-07 01:46:50 UTC+01:00
.. tags: 
.. category: 
.. link: 
.. description: 
.. type: text
.. status: draft
-->

# Introduction

I have used many editors over time and one "System" that I really enjoyed was `Emacs`. However I did not understand how it worked under the hood and it led to some fun times. This post is an attempt to log my experience with learning and understanding the "missing bits" in a single place. But first, let me tell you my story as a naive `Emacs` newbie.

## Icarus' Emacs

By the time I decided to learn `Emacs` I was already a familiar with `Vim` and it's basic keybindings. I knew that even if I were to be using Emacs, I wanted to continue using Vim bindings, which is what `Evil` provides. Also I wanted a better theme than the default one.

This was but the tip of the iceberg of my requirements and I was expecting a lot from Emacs.

I tried doing the "right thing" by going through the Emacs tutorials and to slowly learn it but my aim to start using it for my work projects and I did not want to spend a lot of time sifting through everything the system had to offer.

My solution came down to using a preconfigured emacs setup. In this case, I went with `Spacemacs`. It had everything I needed:

- Beautiful theme
- Evil mode
- Really awesome set of "Layers" (packages/extensions/plugins) enabled by default and ready to use.
- Really nice documentation with well thought out shortcuts etc.

### `develop` branch

I am a Software Engineer by trade and unless I can use Emacs for programming, it cannot be true System/Editor/IDE. Spacemacs has lot of programming related stuff in `develop` branch as it is still being tested.

The more comfortable I felt using Spacemacs the more I started adding in extra "layers" and soon started adding normal Emacs packages.

At some point my thirst of themes led me to also include `Doom Emacs Themes` and by this point I had a crazy heavy setup.

### The Fall

Note that I still haven't taken time to learn how Emacs and/or packages are put together. I was copy-pasting whatever I could find over the internet to make Emacs do my bidding. You could say I was building a Tower of Babel.

As expected, the fateful day came when my Emacs setup had some package issues and it stopped working. It looked like I was the only one who was suffering from this. I tried to restart with vanilla spacemacs but it became impossible. I was unsure if the issue was with my system/Emacs setup or if something was broken on `develop` branch of Spacemacs as `master` is the stable branch.

I could neither use Vanilla Emacs nor could I use Spacemacs and I ended up giving on Emacs altogether.

## Ulysses' Emacs

Spacemacs is an amazing setup and I intend to go back to it. However this time around, I plan on taking my time to learn how the ecosystem works and be mindful of what I am doing.

> Respect your tools

Thanks to Spacemacs I have a decent idea of what Emacs can do and some of the packages I want. I intend to expand on the list of packages I use but I will do so over time. 

### My Emacs needs

Following is the absolute minimum setup and knowledge I need to get started:

- Package Management
	- Default: ELPA
	- Add On: MELPA, MELPA (Stable)
	- package-*
	- use-package
- UX
	- Evil Mode
	- Git client
	- Text Auto Complete
	- Interface Auto Complete
	- Code Folding
- UI
	- Beautiful Theme
	- Beautiful Font (incl. Ligatures, Symbols etc)
	- Beautiful Org Mode
	- Line Numbers
	- Soft Warp (Lines and Words)
	- Indent Guides
	- Startup Screen
- Customization
	- Add Keyboard Shortcuts
	- Keyboard Macros
