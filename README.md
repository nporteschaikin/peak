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
  - See the [syntax](docs/Syntax.md) section for Peak's language-friendly syntax for Tumblr tags, including external files, and more (soon).
  - See the [languages](docs/Languages.md) section for supported template languages.
4. Using a browser, navigate to localhost:1111.
5. To deploy your theme to Tumblr, run `peak deploy` from your project's root folder.

## Getting Started

- [Configuration](docs/Configuration.md)
- [Syntax](docs/Syntax.md)
- [Languages](docs/Languages.md)


## License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](CONTRIBUTING.md)
