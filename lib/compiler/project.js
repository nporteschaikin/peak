var File = require('./file')
  , Tree = require('./tree')

  , when = require('when')
  , fs = require('fs')
  , path = require('path');

var Project = function (peak, context, options) {
  this.peak = peak
  this.context = context;
  this.options = options || {};

  this.tree = new Tree(this.peak.path, this.options.ignore_paths);
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
    if (!fs.existsSync(this.output_path())) fs.mkdirSync(this.output_path());
    for (var x=0; x<paths.length; x++) {
      if (!fs.existsSync(this.output_path(paths[x]))) fs.mkdirSync(this.output_path(paths[x]));
    }
  },

  compile_and_save_project: function () {
    var paths = this.tree.files
      , compilers = [];

    for (var x=0; x<paths.length; x++) {
      var file = new File(paths[x], this.context, this.options);
      compilers.push(file.save(this.output_path(paths[x])));
    }

    return when.all(compilers);
  },

  output_path: function (source_path) {
    var output_path = path.resolve(this.peak.path, this.options.output_path);

    if (typeof source_path === 'string')
      return path.join(output_path, path.relative(this.peak.path, source_path));

    return output_path;
  }

}

module.exports = Project;
