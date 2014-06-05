var Server = require('./server')
  , Compiler = require('../compiler')

  , path = require('path')
  , fs = require('fs')
  , when = require('when')
  , request = require('request')
  , chokidar = require('chokidar')

  , join = path.join
  , relative = path.relative
  , exists = fs.existsSync
  , read = fs.readFileSync
  , write = fs.writeFileSync
  , symlink = fs.symlinkSync
  , mkdir = fs.mkdirSync
  , readdir = fs.readdirSync
  , lstat = fs.lstatSync
  , unlink = fs.unlinkSync;

var Watcher = function (peak) {
  this.peak = peak;
  this.options = peak.options;
  this.emitter = peak.emitter;

  this.dir = join(this.peak.path, '.peak');
  this.server = new Server(this);

  this.emitter
    .on('exit', this.stop.bind(this));
}

Watcher.prototype = {

  start: function () {
    this.emitter.emit('start', 'watch', this.peak.path);
    return when.try(this.create_folder.bind(this))
      .with(this)
      .then(this.request_tumblr_context)
      .then(this.compile.bind(this, this.peak.path))
      .then(this.serve)
      .then(this.watch);
  },

  serve: function () {
    this.server.start();
  },

  stop: function () {
    this.server.stop();
    if (this.watcher) this.watcher.close();
  },

  watch: function () {
    this.watcher = chokidar.watch(this.peak.path, { ignored: /\.peak/ })
      .on('change', this.compile.bind(this));
  },

  create_folder: function () {
    if (!exists(this.dir)) mkdir(this.dir);
  },

  request_tumblr_context: function () {
    if (this.options.blog) {
      this.emitter.emit('init', 'request', this.options.blog);
      return get_tumblr(this.options.blog)
        .with(this)
        .then(this.set_tumblr_context);
    }
  },

  set_tumblr_context: function (body) {
    this.context = body;
    this.emitter.emit('done');
  },

  compile: function (path) {
    var path = path
      , stat = lstat(path)

    if (stat.isFile()) {

      var compiler = new Compiler(read(path, 'utf8'), { path: path })
        , render;

      if (render = compiler.compile()) {
        write(this.out_path(path, compiler.kind.extension), render(this.options.watch.compile, this.context));
        this.emitter.emit('misc', 'compiled', path);
      } else if (!exists(this.out_path(path))) {
        symlink(path, this.out_path(path));
      }

    } else if (stat.isDirectory()) {

      var files = readdir(path);
      if (!exists(this.out_path(path))) mkdir(this.out_path(path));

      for (var x=0; x<files.length; x++) {
        if (this.dir !== path) this.compile(join(path, files[x]));
      }

    }
  },

  out_path: function (path, extension) {
    var path = join(this.dir, relative(this.peak.path, path));
    if (extension) path = path.replace(/.([a-zA-Z]*)$/, extension)
    return path;
  }

}

function get_tumblr (handle) {
  return when.promise(function (resolve, reject) {
    if (handle) {
      var uri = 'http://www.tumblr.com/'
        + 'customize_api/'
        + 'demo_content/'
        + handle;

      request({uri: uri, json: true}, function (error, response, body) {
        if (error) reject(error);
        resolve(body);
      });
    } else {
      resolve();
    }
  })
}

module.exports = Watcher;
