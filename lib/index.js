var Compiler = require('./compiler')
  , Server = require('./server')
  , Sneak = require('sneak')
  , request = require('request')
  , fs = require('fs')
  , path = require('path')
  , when = require('when')
  , url = require('url')
  , events = require('events')

  , read = fs.readFileSync
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
  directory.call(this);
  index.call(this);

  this.server = new Server(this.directory, this.options);

}

peak.prototype = {

  start: function () {
    tumblr.call(this)
      .then(this.compile.bind(this))
      .then(this.watch.bind(this))
      .then(this.server.start.bind(this.server))
      .done(function(){this.emitter.emit('start', this.server.port)}.bind(this))
  },

  stop: function () {
    this.server.stop();
  },

  compile: function (callback) {
    compile.call(this);
    for (var x=0; x<this.watchers.length; x++) {
      this.watchers[x].close();
    }
  },

  watch: function () {
    for (var x=0; x<this.files.length; x++) {
      this.watchers.push(watcher.call(this, this.files[x]));
    }
  }

}

function directory() {
  var path = this.path
    , dir
  if (this.stat.isFile()) path = dirname(this.path);
  dir = join(path, this.options.dir || 'public');
  if (!exists(dir)) mkdir(dir);
  this.directory = dir;
  resolve();
}

function tumblr() {
  var def = when.defer();
  if (this.options.tumblr && !this.context) {
    this.emitter.emit('request');
    req(this.options.tumblr,
      function (err, response, body) {
        if (err) this.emitter.emit('error', err);
        this.emitter.emit('done');
        this.context = body;
        def.resolver.resolve();
      }.bind(this)
    )
  } else {
    def.resolve();
  }
  return def.promise;
}

function compile(path) {
  var path = resolve(path || this.path)
    , stat = lstat(path)
    , render
    , output
    , compiler;

  if (stat.isFile() && FILE_REGEX.test(path)) {

    this.files.push(path);
    render = (SNEAK_REGEX.test(path)) ? Sneak.renderFile(path, this.options) : read(path, this.options);
    output = join(this.directory, basename(path).replace(FILE_REGEX, '.html'));
    compiler = new Compiler(render, this.context);
    write(output, compiler.compile(), this.options);
    this.emitter.emit('compile', basename(path));

  } else if (stat.isDirectory()) {

    files = readdir(path);
    for (var x=0; x<files.length; x++) {
      if (lstat(files[x]).isFile()) compile.call(this, files[x]);
    }

  }
}

function watcher(filename) {
  return watch(filename,
    function () {
      this.server.send('refresh');
      compile.call(this, filename);
    }.bind(this)
  )
}

function index() {
  if (this.options.index || this.stat.isDirectory()) return;
  var index;
  if (this.stat.isFile()) {
    this.options.index = basename(this.path).replace(FILE_REGEX, '.html');
  }
}

function req(handle, fn) {
  var resource = url.parse(
    ['http://www.tumblr.com',
    'customize_api',
    'demo_content',
    handle].join('/')
  )
  return request(resource.href, fn);
}
