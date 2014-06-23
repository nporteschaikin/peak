var Tree = require('./tree')
  , Project = require('./project')
  , File = require('./file')

  , path = require('path');

var Compiler = function (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;
}

Compiler.prototype = {

  compile_file: function (source_path, context) {
    this.file = new File(path.resolve(this.peak.path, source_path), context, this.options.compiler);
    this.emitter.emit('init', 'compiling ' + source_path);

    return this.file.compile()
      .then(this.emitter.emit.bind(this.emitter, 'done'))
      .then(this.file.render_theme.bind(this.file))
  },

  compile_project: function (context) {
    var project = new Project(this.peak, context, this.options);

    this.emitter.emit('init', 'compiling');
    return project.compile()
      .then(this.emitter.emit.bind(this.emitter, 'done'));
  }

}

module.exports = Compiler;
