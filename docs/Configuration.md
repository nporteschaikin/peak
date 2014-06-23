# Configuration

When a peak project is instantiated, `.peakconfig.yml` is generated in the project root to house your project configuration.  These configuration options are available:

```yaml
blog:      # Your Tumblr blog name (e.g. myblog.tumblr.com).
email:     # The e-mail address used to sign into Tumblr; used for deployment.
password:  # The password used to sign into Tumblr; used for deployment.
index:     # The path (relative to root) to the main theme; the theme to be deployed to tumblr; used as the watcher's index.  Defaults to `index.ext`.
compiler:  
  url:     # The base url to join with urls output via our url syntax.
```

These settings may also be set specific to `peak watch` or `peak deploy`:

```yaml
watch:
  blog:
  email:
  password:
  index:
  compiler:
    url:

deploy:
  blog:
  email:
  password:
  index:
  compiler:
    url:
```

Many of these options can be manipulated at runtime; run `peak new`, `peak watch`, or `peak deploy` with `--help` or `-h` for options.
