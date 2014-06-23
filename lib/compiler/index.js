var Tree = require('./tree')
  , Project = require('./project')
  , Tumblr = require('./tumblr')
  , File = require('./file')

  , path = require('path');

var Compiler = function (peak, options) {

  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.ignored_paths = (this.ignore instanceof Array) ? this.ignore : [];
  this.ignored_paths.push(options.output_path);

  this.tumblr = new Tumblr(this.options.blog);
}

Compiler.prototype = {

  compile: function (source_path) {
    return this.compile_file_or_project(source_path);
  },

  compile_with_tumblr: function (source_path) {
    return this.fetch_tumblr()
      .with(this)
      .yield(source_path)
      .then(this.compile_file_or_project)
  },

  fetch_tumblr: function () {
    if (!!!this.tumblr.body) return this.tumblr.fetch();
  },

  compile_file_or_project: function (source_path) {
    if (source_path) return this.compile_file(source_path);
    return this.compile_project();
  },

  compile_file: function (source_path) {
    this.file = new File(source_path, this.tumblr.body, this.options.compiler);
    return this.file.compile();
  },

  render_file: function (source_path) {
    if (this.file) {
      this.compile_file(source_path)
        .with(this.file)
        .then(this.file.render);
    }
  },

  compile_project: function () {
    var output_path = path.resolve(this.peak.path, this.options.output_path)
      , project = new Project(this.peak.path, output_path, this.ignored_paths, this.tumblr.body, this.options.compiler);
    return project.compile();
  }

}

module.exports = Compiler;
