var Tree = require('./tree')
  , File = require('./file')

  , when = require('when')
  , fs = require('fs')
  , path = require('path')

  , mkdir = fs.mkdirSync
  , exists = fs.existsSync
  , basename = path.basename
  , relative = path.relative
  , join = path.join;

var Compiler = function (source_path, destination_path) {
  this.source = source_path;
  this.destination = destination_path;
  this.tree = new Tree(source_path, [basename(destination_path)]);
  this.tree.parse();
}

Compiler.prototype = {

  compile: function () {
    return when.try(this.create_folders.bind(this))
      .with(this)
      .then(this.compile_and_save_files);
  },

  create_folders: function () {
    var paths = this.tree.folders;
    if (!exists(this.destination)) mkdir(this.destination);
    for (var x=0; x<paths.length; x++) {
      if (!exists(this.destination_path(paths[x]))) mkdir(this.destination_path(paths[x]));
    }
  },

  compile_and_save_files: function () {
    var paths = this.tree.files
      , file
      , compilers = [];
    for (var x=0; x<paths.length; x++) {
      file = new File(paths[x], this.destination_path(paths[x]));
      compilers.push(file.save());
    }
    return when.all(compilers);
  },

  destination_path: function (path) {
    return join(this.destination, relative(this.source, path));
  }

}

module.exports = Compiler;
