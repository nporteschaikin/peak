var File = require('./file')
  , Tree = require('./tree')

  , when = require('when')
  , fs = require('fs')
  , path = require('path');

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
    if (!fs.existsSync(this.dest_path)) fs.mkdirSync(this.dest);
    for (var x=0; x<paths.length; x++) {
      if (!fs.existsSync(this.dest_path(paths[x]))) fs.mkdirSync(this.dest_path(paths[x]));
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

  dest_path: function (source_path) {
    return path.join(this.dest, path.relative(this.source, source_path));
  }

}

module.exports = Project;
