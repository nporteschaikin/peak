var Peak = require('../')
  , pkg = require('../../package.json')

  , colors = require('colors')
  , path = require('path')

  , resolve = path.resolve;

var Commands = function (process, args) {
  var path = args.path;
  if (process) path = resolve(process.cwd(), path || '');
  delete args.path;

  this.action = args.action;
  delete args.action;

  this.mute = args.mute;
  delete args.mute;

  this.peak = new Peak(path, args);
  this.emitter = this.peak.emitter;
  this.process = process;
}

Commands.prototype = {

  init: function () {
    var promise;
    if (!this.mute) {
      this.intro();
      this.bind();
    }
    return this.exec()
      .catch(this.error.bind(this));
  },

  exec: function () {
    switch (this.action) {
    case 'deploy':
      return this.peak.deploy();
    case 'new':
      return this.peak.generate();
    default:
      return this.peak.watch();
    }
  },

  exit: function () {
    if (this.process) this.process.exit();
    this.emitter.emit('exit');
  },

  error: function (error) {
    this.write('ERROR: '.bold.red + error.message.red + '\n');
  },

  intro: function () {
    console.log(("     " + pkg.name + "     ").inverse.bold);
    console.log(('version ' + pkg.version).grey);
    console.log();
  },

  bind: function () {
    this.emitter
      .on('init', this.initEvent.bind(this))
      .on('done', this.doneEvent.bind(this))
      .on('start', this.startEvent.bind(this))
      .on('finish', this.finishEvent.bind(this))
    if (this.process) this.process.on('SIGINT', this.exit.bind(this));
  },

  write: function (str) {
    if (this.process) this.process.stdout.write(str);
  },

  initEvent: function (action) {
    this.write((String(action) + '... ').grey);
  },

  doneEvent: function () {
    this.write('done!'.green + '\n');
  },

  startEvent: function (action) {
    this.write(('started ' + String(action) + '!').green + '\n');
  },

  finishEvent: function (action) {
    this.write(('finished '.bold + String(action) + '!').green + '\n');
  }

}

module.exports = Commands;
