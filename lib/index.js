var Compiler = require('./compiler')
  , Server = require('./server')
  , Sneak = require('sneak')
  , request = require('request')
  , fs = require('fs')
  , path = require('path')
  , when = require('when')
  , url = require('url')
  , events = require('events')
  , highlight = require('highlight.js')
  , beautify = require('js-beautify').html_beautify

  , readfile = fs.readFileSync
  , watch = fs.watch
  , lstat = fs.lstatSync
  , exists = fs.existsSync
  , mkdir = fs.mkdirSync
  , readdir = fs.readdirSync
  , write = fs.writeFileSync
  , symlink = fs.symlinkSync
  , unlink = fs.unlinkSync
  , dirname = path.dirname
  , join = path.join
  , resolve = path.resolve
  , basename = path.basename

  , THEME_REGEX = /(\.htm|\.html|\.sneak)$/
  , SNEAK_REGEX = /\.sneak$/;

var peak = module.exports = function peak (path, options) {

  this.options = options || {};
  this.themes = [];
  this.dirs = {};
  this.links = [];
  this.watchers = [];
  this.emitter = new events.EventEmitter;
  this.path = resolve(path);
  this.stat = lstat(this.path);

}

peak.prototype = {

  start: function (callback) {
    return tumblr.call(this)
      .with(this)
      .then(tree)
      .then(find)
      .then(compile)
      .then(link)
      .then(theme)
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

  if (!this.options.encoding) this.options.encoding = 'utf8';

  if (stat.isFile()) {

    if (!THEME_REGEX.test(path)) {
      this.links.push(path);
    } else {
      store.call(this, path);
    }

  } else if (stat.isDirectory() && path !== this.dirs.base) {

    files = readdir(path);
    if (path !== this.path) this.links.push(path);
    for (var x=0; x<files.length; x++) {
      find.call(this, join(path, files[x]));
    }

  }
}

function store (path) {
  var file
    , pathExists;

  if (SNEAK_REGEX.test(path)) {
    file = Sneak.renderFile(path, this.options);
  } else {
    file = readfile(path, this.options.encoding);
  }


  for (var x=0; x<this.themes.length; x++) {
    if (this.themes[x].path == path) {
      this.themes[x].read = file;
      pathExists = true;
      continue;
    }
  }

  if (!pathExists) {
    this.themes.push({
      path: path,
      read: file
    });
  }

}

function tree () {

  var path = this.path;

  if (this.stat.isFile()) {
    this.options.index = basename(path)
      .replace(THEME_REGEX, '.html');
    path = dirname(this.path);
  }

  if (!this.options.basepath) this.options.basepath = path;

  this.dirs.base = join(path, '.peak');
  if (!exists(this.dirs.base)) mkdir(this.dirs.base);

  this.dirs.public = join(this.dirs.base, 'public');
  if (!exists(this.dirs.public)) mkdir(this.dirs.public);

}

function compile (obj) {

  var compiler
    , read
    , filename
    , themes = obj ? [obj] : this.themes;

  for (var x=0; x<themes.length; x++) {

    compiler = new Compiler(themes[x].read, this.context);

    filename = basename(themes[x].path).replace(THEME_REGEX, '.html');
    write(join(this.dirs.base, filename), themes[x].read);
    write(join(this.dirs.public, filename), compiler.compile());

    this.emitter.emit('compile', basename(themes[x].path));

  }

}

function link () {

  var path
    , base;

  for (var x=0; x<this.links.length; x++) {
    base = basename(this.links[x]);
    path = join(this.dirs.public, base);
    if (exists(path)) continue;
    symlink(this.links[x], path);
  }

}

function theme (obj) {

  if (this.options.theme) {

    var themeDir = join(__dirname, 'theme')
      , themeFiles = readdir(themeDir, this.options.encoding)
      , theme = join(themeDir, 'index.sneak')
      , output
      , path
      , themes = obj ? [obj] : this.themes;

    this.dirs.theme = join(this.dirs.public, 'theme');
    if (!exists(this.dirs.theme)) mkdir(this.dirs.theme);

    for (var x=0; x<themeFiles.length; x++) {

      path = join(this.dirs.theme, themeFiles[x]);
      if (SNEAK_REGEX.test(themeFiles[x]) || exists(path)) continue;
      symlink(join(themeDir, themeFiles[x]), path);

    }

    for (var x=0; x<themes.length; x++) {

      output = themes[x].read;
      output = beautify(output);
      output = highlight.highlight("html", output).value
      output = output
        .replace(/\n/g, '<br />')
        .replace(/\>(\s*)\</gm, function (match, p1, offset, s) { return match.replace(/\s/, '&nbsp;') } );

      output = Sneak.renderFile(theme, {
        basename: basename(themes[x].path),
        theme: output
      });

      path = join(this.dirs.theme, basename(themes[x].path).replace(THEME_REGEX, '.html'));
      write(path, output);

    }

  }

}

function watcher () {

  for (var index=0; index<this.themes.length; index++) {

    this.watchers.push(watch(this.themes[index].path, function (index) {

      store.call(this, this.themes[index].path);
      compile.call(this, this.themes[index]);
      theme.call(this, this.themes[index]);

      this.server.send('refresh');

    }.bind(this, index)));

  }

}

function start () {
  this.server = new Server(this.dirs.public, this.options);
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

function _escape (str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
