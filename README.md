peak
===============

[![NPM version](https://badge.fury.io/js/peak.svg)](http://badge.fury.io/js/peak) [![tests](https://travis-ci.org/nporteschaikin/peak.png?branch=master)](https://travis-ci.org/nporteschaikin/peak)

Finally!  A framework for efficiently developing Tumblr themes.

### Why should you care?
To quote [@jenius](https://github.com/carrot/carrot-the-company/blob/master/ideas/tumblr-parser.md):

> Tumblr development at the moment is severely painful - you have to write the code without the tumblr tags, then paste it into tumblr to test. Their online text editor is slower, more awkward, and doesn't have the version control and text editing shortcuts we know, love, and rely on.

My answer is **peak**, a development framework for Tumblr themes.  

- natively supports [sneak](http://www.github.com/nporteschaikin/sneak), my [jade](http://www.github.com/visionmedia/jade)-inspired template language which includes support for tumblr blocks and tags.
- watches and compiles themes in sneak or vanilla HTML seamlessly!
- server outputs your theme, compiled with your tumblr (or any tumblr, for that matter).

### Installation

```
$ npm install peak -g
```

### Usage

1. Create a sneak or html file to serve:

  ```
  $ touch my-tumblr-theme.sneak
  ```

  peak can also compile and serve a folder.  


2. Write your tumblr theme.  
  - [sneak's readme](http://www.github.com/nporteschaikin/sneak/tree/master/README.md)
  - [tumblr's theme documentation](http://www.tumblr.com/docs/en/custom_themes).

3. Run peak; include your tumblr with the `--tumblr` argument (optional):

  ```
  $ peak my-tumblr-theme.sneak --tumblr a-tumblr-handle
  ```

  Run with `--help` or `-h` for all options.

5. Go!

  - Using a browser, navigate to localhost:1111 (to specify a different port, use the `--port` argument).
  - peak watches for changes to all theme files and instantly recompiles them.
  - To output your pre-compiled theme, use the `--theme` option and navigate to `localhost:1111/theme`; this is also output instantly when changes are made to your theme.

## License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](CONTRIBUTING.md)
