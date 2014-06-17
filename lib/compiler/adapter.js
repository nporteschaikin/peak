var path = require('path')

  , extension = path.extname
  , dirname = path.dirname;

var map = {

  compilers: {

    'coffee-script': {
      kind: 'javascript',
      render: function (str, path) {
        return require('coffee-script').compile(str);
      }
    },

    'css': {
      kind: 'css',
      render: function (str, path) {
        return str;
      }
    },

    'haml': {
      kind: 'html',
      render: function (str, path) {
        return require('hamljs').render(str, { filename: path });
      }
    },

    'html': {
      kind: 'html',
      render: function (str, path) {
        return str;
      }
    },

    'jade': {
      kind: 'html',
      render: function (str, path) {
        return require('jade').render(str, { filename: path });
      }
    },

    'js': {
      kind: 'javascript',
      render: function (str, path) {
        return str;
      }
    },

    'less': {
      kind: 'css',
      render: function (str, path) {
        var css;
        require('less').render(str, { filename: path }, function (error, output) {
          if (error) throw error;
          css = output;
        });
        return css;
      }
    },

    'sneak': {
      kind: 'html',
      render: function (str, path) {
        return require('sneak').render(str, { basepath: dirname(path) });
      }
    },

    'stylus': {
      kind: 'css',
      render: function (str, path) {
        return require('stylus').render(str, { filename: path });
      }
    }

  },

  extensions: {

    '.coffee': 'coffee-script',
    '.css': 'css',
    '.haml': 'haml',
    '.html': 'html',
    '.jade': 'jade',
    '.js': 'js',
    '.less': 'less',
    '.sneak': 'sneak',
    '.styl': 'stylus'

  },

  kinds: {

    css: {
      extension: '.css',
      enclosure: {
        html: {
          open: function (attrs) {
            var open = '<style type="text/css"';
            for (var attr in attrs) open += ' ' + attr + '="' + attrs[attr] + '"';
            return open + '>';
          },
          close: function () {
            return '</style>';
          }
        }
      }
    },

    html: {
      extension: '.html'
    },

    javascript: {
      extension: '.js',
      enclosure: {
        html: {
          open: function (attrs) {
            var open = '<script type="text/javascript"';
            for (var attr in attrs) open += ' ' + attr + '="' + attrs[attr] + '"';
            return open + '>';
          },
          close: function () {
            return '</script>';
          }
        }
      }
    }

  }

}

module.exports = function (str, options) {

  if (!options.with && options.path) {
    options.with = map.extensions[extension(options.path)];
  }

  var compiler = map.compilers[options.with];
  if (compiler) {
    var kind = map.kinds[compiler.kind];
    kind.name = compiler.kind;
    return {
      source: compiler.render(str)
      , kind: kind
    }
  };

  return false;
}
