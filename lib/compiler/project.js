var File = require('./file')
  , Tree = require('./tree')

  , when = require('when')
  , fs = require('fs')
  , path = require('path')

  , mkdir = fs.mkdirSync
  , exists = fs.existsSync
  , relative = path.relative
  , join = path.join;

var Project = function (source, dest, ignore, context, options) {
  this.source = source;
  this.dest = dest;
  this.context = context;

  this.tree = new Tree(source, ignore);
  this.tree.parse();
}

Project.prototype = {

  compile: function () {
    return when.try(this.create_folders.bind(this))
      .with(this)
      .then(this.compile_and_save_project);
  },

  create_folders: function () {
    var paths = this.tree.folders;
    if (!exists(this.dest_path)) mkdir(this.dest);
    for (var x=0; x<paths.length; x++) {
      if (!exists(this.dest_path(paths[x]))) mkdir(this.dest_path(paths[x]));
    }
  },

  compile_and_save_project: function () {
    var paths = this.tree.files
      , compilers = [];

    for (var x=0; x<paths.length; x++) {
      var file = new File(paths[x], this.context, this.options);
      compilers.push(file.save(this.dest_path(paths[x])));
    }

    return when.all(compilers);
  },

  dest_path: function (path) {
    return join(this.dest, relative(this.source, path));
  }

}

module.exports = Project;
