var Adapter = require('../adapter')
  , Theme = require('../theme')

  , when = require('when')
  , fs = require('fs');

var File = function (path, context, options) {
  if (arguments.length == 2) {
    options = context;
  } else {
    this.context = context;
  }

  this.path = path;
  this.options = options || {};
}

File.prototype = {

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
    fs.readFile(__this.path, 'utf8', function (error, source) {
      if (error) throw error;
      var themeOptions = __this.options;
      themeOptions.path = __this.path;
      __this.theme = new Theme(source, themeOptions);
      resolve(__this);
    });
  },

  render_theme: function () {
    if (this.theme) return this.theme.render(this.context, this.options);
    return false;
  },

  save: function (dest_path) {
    return this.compile()
      .with(this)
      .yield(dest_path)
      .then(this.write_or_symlink);
  },

  write_or_symlink: function (dest_path) {
    var __this = this;
    return when.promise(function (resolve) {
      if (__this.theme) {
        __this.write_theme(dest_path, resolve);
      } else {
        __this.symlink_file(dest_path, resolve);
      }
    });
  },

  write_theme: function (dest_path, resolve) {
    var __this = this;
    fs.writeFile(dest_path.replace(/\.([a-zA-Z]*)$/, __this.theme.kind.extension)
      , __this.render_theme(__this.context, __this.options)
      , function (error) {
        if (error) throw error;
        resolve(__this);
      }
    );
  },

  symlink_file: function (dest_path, resolve) {
    var __this = this;
    fs.symlink(__this.path, dest_path, resolve);
  }

}

module.exports = File;
