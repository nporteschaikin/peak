peak
===============

[![NPM version](https://badge.fury.io/js/peak.svg)](http://badge.fury.io/js/peak) [![tests](https://travis-ci.org/nporteschaikin/peak.png?branch=master)](https://travis-ci.org/nporteschaikin/peak)

Peak is a node toolkit for developing and deploying Tumblr themes.

- **Write** Tumblr themes with your favorite HTML, CSS, and JavaScript preprocessors; include Tumblr tags natively with language-friendly syntax.
- **Preview** Tumblr themes in real-time with actual Tumblr content.
- **Deploy** to Tumblr with one prompt in your command line.

### Installation

via npm:

```
$ npm install peak -g
```

### Usage

1. Create a new peak project:

  ```
  $ peak new mytheme
  ```

  where `mytheme` is the path of the folder you'd like to create.  Optionally, run `peak new` with flags to configure your project (see [configuration options](#configuration)).
2. Change directory to `mytheme` and start the watcher:

  ```
  $ cd mytheme
  $ peak watch
  ```

  Run with `--help` or `-h` for options.
3. Write your Tumblr theme!
  - See the [syntax](#Syntax) section for Peak's language-friendly syntax for Tumblr tags, including external files, and more (soon).
  - See the [languages](docs/Languages.md) section for supported template languages.
4. Using a browser, navigate to localhost:1111.
5. To deploy your theme to Tumblr, run `peak deploy` from your project's root folder.

### Syntax

**[Peak includes language-agnostic syntax](docs/Syntax.md)** for incorporating Tumblr tags in HTML, CSS, and JavaScript along with Peak-specific tags to further simplify Tumblr development.

Take, for example, this HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>!(Title)</title>
    <!-- +(src: 'style.styl' media: 'all') -->
    <!-- +(src: 'main.coffee') -->
  </head>
  <body>
    <img src="@(images/peak.jpg)" />
    <!-- #(Posts) -->
      <article>
        <h1>!(Title)</h1>
      </article>
    <!-- ## -->
  </body>
</html>
```

Peak includes unique syntax for:

- inlining a theme (HTML, CSS or JavaScript).
  ```html
  <!-- +(src: 'style.styl' media: 'all') -->
  <!-- +(src: 'main.coffee') -->
  ```

- applying base URLs to external assets specific to watching or deploying.
  ```html
  <img src="@(images/peak.jpg)" />
  ```

When watching the theme, Peak will render Tumblr tags with the specified blog's context, like so:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Peak Blog</title>
    <style type="text/css" media="all">
    body { background: white; }
    </style>
    <script type="text/javascript">
    alert('Hello World');
    </script>
  </head>
  <body>
    <img src="http://my-s3-bucket.com/dev/images/peak.jpg" />
    <article>
      <h1>Post 1</h1>
    </article>
    <article>
      <h1>Post 2</h1>
    </article>
    <article>
      <h1>Post 3</h1>
    </article>
  </body>
</html>
```

However, on deploy, Peak will compile Tumblr tags in their standard syntax:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{Title}</title>
    <style type="text/css" media="all">
    body { background: white; }
    </style>
    <script type="text/javascript">
    alert('Hello World');
    </script>
  </head>
  <body>
    <img src="http://my-s3-bucket.com/production/images/peak.jpg" />
    {block:Posts}
      <article>
        <h1>{Title}</h1>
      </article>
    {/block:Posts}
  </body>
</html>
```

For more, check out the [Syntax](docs/Syntax.md) docs.

## Documentation

- [Configuration](docs/Configuration.md)
- [Syntax](docs/Syntax.md)
- [Languages](docs/Languages.md)

## Known issues

- Certain Tumblr tags are incompatible with Peak as they're not part of Tumblr's public customize API.

## License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](CONTRIBUTING.md)
