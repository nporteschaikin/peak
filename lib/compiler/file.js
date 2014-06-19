var Adapter = require('../adapter')
  , Theme = require('../theme')

  , when = require('when')
  , fs = require('fs')

  , read = fs.readFile
  , write = fs.writeFile
  , symlink = fs.symlink
  , exists = fs.existsSync;

var File = function (path, options) {
  this.path = path;
  this.options = options || {};
}

File.prototype = {

  save: function (dest_path, context) {
    return this.compile()
      .then(this.write_or_symlink(dest_path, context));
  },

  compile: function () {
    var __this = this;
    return when.promise(function (resolve) {
      if (Adapter.supports({path: __this.path})) {
        __this.compile_theme(resolve);
      } else {
        resolve(__this);
      }
    });
  },

  compile_theme: function (resolve) {
    var __this = this
      , theme;
    read(__this.path, 'utf8', function (error, source) {
      if (error) throw error;
      __this.theme = new Theme(source, {path: __this.path});
      resolve(__this);
    });
  },

  render_theme: function (context) {
    return this.theme.render(context, this.options);
  },

  write_or_symlink: function (dest_path, context) {
    var __this = this;
    return function () {
      return when.promise(function (resolve) {
        if (__this.theme) {
          __this.write(dest_path, context, resolve);
        } else {
          __this.symlink(dest_path, resolve);
        }
      });
    }
  },

  write: function (dest_path, context, resolve) {
    var __this = this;
    write(dest_path.replace(/.([a-zA-Z]*)$/, __this.theme.kind.extension), __this.render_theme(context),
      function (error) {
        if (error) throw error;
        resolve();
      }
    );
  },

  symlink: function (dest_path, resolve) {
    var __this = this;
    symlink(__this.path, dest_path, resolve);
  }

}

module.exports = File;
