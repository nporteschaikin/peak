peak
===============

Finally!  A framework for efficiently developing Tumblr themes.

### Why should you care?
To quote [@jenius](https://github.com/carrot/carrot-the-company/blob/master/ideas/tumblr-parser.md):

> Tumblr development at the moment is severely painful - you have to write the code without the tumblr tags, then paste it into tumblr to test. Their online text editor is slower, more awkward, and doesn't have the version control and text editing shortcuts we know, love, and rely on.

My answer is **peak**, a development framework for Tumblr themes.  

- natively supports [sneak](http://www.github.com/nporteschaikin/sneak), my [jade](http://www.github.com/visionmedia/jade)-inspired template language which includes support for tumblr blocks and tags.
- watches and compiles themes in sneak or vanilla HTML -- seamlessly!
- server outputs your theme, compiled with your tumblr -- or any tumblr, for that matter.

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

3. Run peek; include your tumblr with the `-t` option:

  ```
  $ peak my-tumblr-theme.sneak -t a-tumblr-handle
  ```

  Run with `--help` or `-h` for all options.

4. Using a browser, navigate to `http://localhost:1111`.

5. Edit your theme; peak watches all pertinent files, recompiles, and serves them instantly.

## License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](CONTRIBUTING.md)
