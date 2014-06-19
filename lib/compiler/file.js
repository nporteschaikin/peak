var Adapter = require('../adapter')
  , Theme = require('../theme')

  , when = require('when')
  , fs = require('fs')

  , read = fs.readFile
  , write = fs.writeFile
  , symlink = fs.symlink
  , exists = fs.existsSync;

var File = function (path, dest_path) {
  this.path = path;
  this.dest_path = dest_path;
}

File.prototype = {

  save: function () {
    return this.compile()
      .with(this)
      .then(this.write_or_symlink);
  },

  compile: function () {
    var __this = this;
    return when.promise(function (resolve, reject, notify) {
      if (Adapter.supports({path: __this.path})) {
        __this.compile_theme(resolve, reject, notify);
      } else {
        resolve(__this);
      }
    });
  },

  compile_theme: function (resolve, reject, notify) {
    var __this = this
      , theme;
    read(__this.path, 'utf8', function (error, source) {
      if (error) throw error;
      __this.theme = new Theme(source, {path: __this.path});
      resolve(__this);
    });
  },

  write_or_symlink: function () {
    if (this.theme) {
      return when.promise(this.write());
    }
    return when.promise(this.symlink());
  },

  write: function () {
    var __this = this;
    return function (resolve, reject, notify) {
      write(__this.dest_path.replace(/.([a-zA-Z]*)$/, __this.theme.kind.extension), __this.theme.render(),
        function (error) {
          if (error) throw error;
          resolve();
        }
      );
    }
  },

  symlink: function () {
    var __this = this;
    return function (resolve, reject, notify) {
      symlink(__this.path, __this.dest_path, resolve);
    }
  }

}

module.exports = File;
