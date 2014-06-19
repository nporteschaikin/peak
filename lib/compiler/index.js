var Tree = require('./tree')
  , Tumblr = require('./tumblr')
  , File = require('./file')

  , when = require('when')
  , fs = require('fs')
  , path = require('path')

  , mkdir = fs.mkdirSync
  , exists = fs.existsSync
  , basename = path.basename
  , relative = path.relative
  , join = path.join
  , resolve = path.resolve;

var Compiler = function (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.destination = resolve(this.peak.path, options.output_path);
  this.tree = new Tree(this.peak.path, [options.output_path]);
  this.tree.parse();

  if (this.options.blog) this.tumblr = new Tumblr(this.options.blog);
}

Compiler.prototype = {

  compile: function () {
    return when.try(this.emit_init.bind(this))
      .with(this)
      .then(this.create_folders)
      .then(this.get_tumblr)
      .then(this.compile_and_save_files)
      .then(this.emit_done);
  },

  emit_init: function () {
    this.emitter.emit('init', 'compiling');
  },

  emit_done: function () {
    this.emitter.emit('done');
  },

  create_folders: function () {
    var paths = this.tree.folders;
    if (!exists(this.destination)) mkdir(this.destination);
    for (var x=0; x<paths.length; x++) {
      if (!exists(this.destination_path(paths[x]))) mkdir(this.destination_path(paths[x]));
    }
  },

  get_tumblr: function () {
    if (this.tumblr) return this.tumblr.get();
  },

  compile_and_save_files: function () {
    var paths = this.tree.files
      , compilers = [];

    for (var x=0; x<paths.length; x++) {
      var file = new File(paths[x], this.options.compiler)
        , compiler;

      compiler = file.save(this.destination_path(paths[x]), this.tumblr.json);
      compilers.push(compiler);
    }
    return when.all(compilers);
  },

  destination_path: function (path) {
    return join(this.destination, relative(this.peak.path, path));
  }

}

module.exports = Compiler;
