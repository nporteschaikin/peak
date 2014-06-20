var Tree = require('./tree')
  , Project = require('./project')
  , Tumblr = require('./tumblr')
  , File = require('./file')

  , path = require('path')

  , resolve = path.resolve;

var Compiler = function (peak, options) {

  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.ignored_paths = (this.ignore instanceof Array) ? this.ignore : [];
  this.ignored_paths.push(options.output_path);

  this.tumblr = new Tumblr(this.options.blog);
}

Compiler.prototype = {

  compile: function (path) {
    return this.compile_file_or_project(path);
  },

  compile_with_tumblr: function (path) {
    return this.fetch_tumblr()
      .with(this)
      .yield(path)
      .then(this.compile_file_or_project)
  },

  fetch_tumblr: function () {
    if (!!!this.tumblr.body) return this.tumblr.fetch();
  },

  compile_file_or_project: function (path) {
    if (path) return this.compile_file(path);
    return this.compile_project();
  },

  compile_file: function (path) {
    this.file = new File(path, this.tumblr.body, this.options.compiler);
    return this.file.compile();
  },

  render_file: function (path) {
    if (this.file) {
      this.compile_file(path)
        .with(this.file)
        .then(this.file.render);
    }
  },

  compile_project: function () {
    var output_path = resolve(this.peak.path, this.options.output_path)
      , project = new Project(this.peak.path, output_path, this.ignored_paths, this.tumblr.body, this.options.compiler);
    return project.compile();
  }

}

module.exports = Compiler;
