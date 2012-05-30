# Subito

*subito /'su.bi.to/* - (int.) Adverb: 1. (*music*) suddenly

Subito is a JavaScript library for music engraving. It strives to render beautiful
music scores, while maintaining a good level of performance. Subito is the main project
of the *Subito Project* which aims at providing a full musical understanding to the
web. It includes *Teoria.js*, a robust music theory framework, MusicJSON which is a 
port of the MusicXML language to the more simple and lightweight JSON. Futhermore a
*fontviewer* side-project is available for listing all available glyphs in a SVG
font file.

I'm far from even having a somewhat functional framework, but the code is constantly
improving, and hopefully this might end up quite functional someday.

## Installation

You'll need the *mingler* and *jake* (and optionally *colors*) NPM packages, this
shold be easy to install with `npm install` at the project root.

Clone the repository, fetch submodules and install dependencies:

    $ git clone git://github.com/saebekassebil/subito.git
    $ git submodule init && git submodule update
    $ npm install

Build the concatenated (and optionally minified) build file:

`jake` or `jake build[minify]` or `jake build[font]` or `jake build[font,minify]`

## Examples

The main file I use for testing i located at `test/index.html` and this is where
you can see the programmatic usage of the library. A more extravagant example is
found in `examples/scales.html`.

## Usage

Right now I haven't made any documentation of the code, besides those notes
which are already written in the source code. This is quite possibly a bad
idea, but by diving into the code by looking at the examples and test documents you
should be well on your way to understand the code.

There's also a standalone mode, which can be built by `jake build[standalone]`. This
(should) render all scores embedded in the document.

## Can I help?

You sure can! The rendering code needs a lot of love, but everything you can contribute
with will be highly appreciated! Please feel free to submit issues, and submit 
pull requests, they'll be eagerly received :)

