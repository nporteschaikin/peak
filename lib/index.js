var Compiler = require('./compiler')
  , Server = require('./server')
  , Sneak = require('sneak')
  , request = require('request')
  , fs = require('fs')
  , path = require('path')
  , when = require('when')
  , url = require('url')
  , events = require('events')

  , readfile = fs.readFileSync
  , watch = fs.watch
  , lstat = fs.lstatSync
  , exists = fs.existsSync
  , mkdir = fs.mkdirSync
  , readdir = fs.readdirSync
  , write = fs.writeFileSync
  , dirname = path.dirname
  , join = path.join
  , resolve = path.resolve
  , basename = path.basename

  , FILE_REGEX = /(\.htm|\.html|\.sneak)$/
  , SNEAK_REGEX = /\.sneak$/;

var peak = module.exports = function peak (path, options) {

  this.options = options || {};
  this.files = [];
  this.watchers = [];
  this.emitter = new events.EventEmitter;
  this.path = resolve(path);
  this.stat = lstat(this.path);

}

peak.prototype = {

  start: function (callback) {
    return tumblr.call(this)
      .with(this)
      .then(find)
      .then(tree)
      .then(compile)
      .then(watcher)
      .then(start)
      .done(callback);
  },

  stop: function () {
    if (this.server) this.server.stop();
  }

}

function tumblr() {

  var def = when.defer();

  if (this.options.tumblr && !this.context) {

    this.emitter.emit('request');

    _req(this.options.tumblr, function (err, response, body) {

      if (err) this.emitter.emit('error', err);

      this.emitter.emit('done');
      this.context = body;

      def.resolve();

    }.bind(this))

  } else {

    def.resolve();

  }

  return def.promise;
}

function find (path) {
  var path = resolve(path || this.path)
    , stat = lstat(path)
    , files
    , file;

  if (stat.isFile() && FILE_REGEX.test(path)) {
    this.files.push(path);
  } else if (stat.isDirectory()) {
    files = readdir(path);
    for (var x=0; x<files.length; x++) {
      file = join(path, files[x]);
      if (lstat(file).isFile()) find.call(this, file);
    }
  }
}

function tree () {

  var path = this.path;

  if (this.stat.isFile()) {
    this.options.index = basename(path)
      .replace(FILE_REGEX, '.html');
    path = dirname(this.path);
  }

  this.base = join(path, '.peak');
  if (!exists(this.base)) mkdir(this.base);

  this.public = join(this.base, 'public');
  if (!exists(this.public)) mkdir(this.public);

}

function compile (path) {
  var compiler
    , read
    , filename
    , files = path ? [path] : this.files;

  if (!this.options.encoding) this.options.encoding = 'utf8';

  for (var x=0; x<files.length; x++) {

    if (SNEAK_REGEX.test(files[x])) {
      read = Sneak.renderFile(this.files[x], this.options);
    } else {
      read = readfile(this.files[x], this.options);
    }

    compiler = new Compiler(read, this.context);

    filename = basename(this.files[x]).replace(FILE_REGEX, '.html');
    write(join(this.base, filename), read);
    write(join(this.public, filename), compiler.compile());

    this.emitter.emit('compile', filename);

  }

}

function watcher () {
  for (var x=0; x<this.files.length; x++) {
    this.watchers.push(watch(this.files[x], function () {
      this.compile(this.files[x]);
      this.server.send('refresh');
    }.bind(this)));
  }
}

function start () {
  this.server = new Server(this.public, this.options);
  this.server.start();
  this.emitter.emit('start', this.server.port);
}

function _req(handle, fn) {
  var resource = url.parse(
    ['http://www.tumblr.com',
    'customize_api',
    'demo_content',
    handle].join('/')
  )
  return request(resource.href, fn);
}
