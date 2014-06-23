var File = require('./file')
  , Tree = require('./tree')

  , when = require('when')
  , fs = require('fs')
  , path = require('path');

var Project = function (peak, context, options) {
  this.peak = peak
  this.context = context;
  this.options = options || {};

  this.tree = new Tree(this.peak.path, this.options.is_ignored);
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
    if (!fs.existsSync(this.options.out_path())) fs.mkdirSync(this.options.out_path());
    for (var x=0; x<paths.length; x++) {
      if (!fs.existsSync(this.options.out_path(paths[x]))) fs.mkdirSync(this.options.out_path(paths[x]));
    }
  },

  compile_and_save_project: function () {
    var paths = this.tree.files
      , compilers = [];

    for (var x=0; x<paths.length; x++) {
      var file = new File(paths[x], this.context, this.options.compiler);
      compilers.push(file.save(this.options.out_path(paths[x])));
    }

    return when.all(compilers);
  }

}

module.exports = Project;
