module.exports = {

  compilers: {

    'coffee-script': {
      kind: 'javascript',
      render: function (source, options) {
        var coffee = require('coffee-script')
        return coffee.compile(source, options);
      }
    },

    'css': {
      kind: 'css',
      render: function (source, options) {
        return source;
      }
    },

    'haml': {
      kind: 'html',
      render: function (source, options) {
        var haml = require('hamljs')
        return haml.render(source, options);
      }
    },

    'html': {
      kind: 'html',
      render: function (source, options) {
        return source;
      }
    },

    'jade': {
      kind: 'html',
      render: function (source, options) {
        var jade = require('jade');
        options.pretty = true;
        
        return jade.render(source, options);
      }
    },

    'js': {
      kind: 'javascript',
      render: function (source) {
        return source;
      }
    },

    'less': {
      kind: 'css',
      render: function (source, options) {
        var less = require('less')
          , output;
        less.render(source, options, function (error, css) {
          if (error) throw error;
          output = css;
        });
        return output;
      }
    },

    'sneak': {
      kind: 'html',
      render: function (source, options) {
        var sneak = require('sneak');
        return sneak.render(source, { basepath: dirname(options.path) });
      }
    },

    'stylus': {
      kind: 'css',
      render: function (source, options) {
        var stylus = require('stylus');
        return stylus.render(source, options);
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
