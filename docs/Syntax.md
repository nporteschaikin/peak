# Syntax

Peak is language-agnostic. It includes syntax for Tumblr tags written to be compatible with any HTML, CSS, or JavaScript template language; where possible, it also parses conventional Tumblr tags.  Peak also include special syntactical sugar to make Tumblr development more efficient.

- [Tumblr tags](#tumblr-tags)
- [Custom tags](#custom-tags)

## Tumblr Tags

### Blocks

```
{block:Photo}{/block:Photo}
```

##### HTML

```
HTML      <!-- #(Photo) -->
            <div class="post">
            </div>
          <!-- ## -->

Jade      // #(Photo)
            div.post
          // ##
```

##### CSS

```
CSS       /* #(Photo) */
          .post {
            background: #000;
          }
          /* ## */

Stylus    // #(Photo)
            background: #000;
          // ##
```

##### JavaScript

```
JS        // #(Photo)
            console.log('A photo!')
          // ##

Coffee    / #(Photo)
            console.log 'A photo!'
          / ##

```

### General tags

```
{name}
```

##### HTML

```
HTML      <header>!(name)</header>

Jade      header !(name)
```

##### CSS

```
CSS       .post {
            color: !(name);
          }

Stylus    .post
            color: !(name)
```

##### JavaScript

```
JS        console.log('!(name)')
Coffee    console.log '!(name)'

```

## Custom Tags

### +(src: path [attr1: 'value1' attr2: 'value2' ...])

Inline an external HTML, JavaScript or CSS theme.  Peak will automatically compile with the appropriate template processor based on the external file's extension.  If CSS or JavaScript is included in HTML, Peak will automatically wrap the output with the appropriate HTML tag and any additional attributes.

```
HTML      <!-- +(src: "style.css" media: "all") -->
Jade      // +(src: "style.css" media: "all")

CSS       /* +(src: "style.css") */
Stylus    // +(src: "style.css")

JS        // +(src: "carousel.js")
Coffee    // +(src: "carousel.coffee")
```

An example:
```html
<!-- index.html -->

<html>
  <head>
    <!-- +(src: 'style.css' media: 'all') -->
  </head>
  <body>
  </body>
</html>
```

Assuming `style.css` is:
```css
/* style.css */
body { background: black; }
```

The result is:
```html
<!-- index.html -->

<html>
  <head>
    <style type="text/css" media="all">
      body { background: black; }
    </style>
  </head>
  <body>
  </body>
</html>
```

### @(url)

Configure different base URLs for watching and deploying.

```
HTML      <img src="@(images/peak.jpg)" />
Jade      img(src="@(images/peak.jpg)")

CSS       body {
            background: url("@(images/peak.jpg)")
          }
Stylus    body
            background: url("@(images/peak.jpg)");

JS        var logo = "@(images/peak.jpg)";
Coffee    logo = "@(images/peak.jpg)"
```

Assume the following configuration:
```
deploy:
  compile:
    url: 'http://production.carrotcreative.com/'
watch:
  compile:
    url: 'http://development.carrotcreative.com/'
```

URLs wrapped in `@()` will be prepended with `http://production.carrotcreative.com/` on deploy and `http://development.carrotcreative.com/` when watched.
