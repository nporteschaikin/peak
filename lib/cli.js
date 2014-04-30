var peak = require('..')
  , fs = require('fs')
  , path = require('path')
  , events = require('events')
  , colors = require('colors')

  , read = fs.readFileSync
  , resolve = path.resolve

  , pkg = require('../package.json');

var cli = module.exports = function cli (args, process) {
  this.args = args;
  this.peak = new peak(args.path, args);
  this.process = process;
  this.emitter = this.peak.emitter;
  this.events();
  this.sigint();
};

cli.prototype = {

  exec: function (callback) {
    this.intro();
    this.peak.start(callback);
  },

  intro: function () {
    console.log(("     " + pkg.name + "     ").inverse.bold);
    console.log(('version ' + pkg.version).grey);
    console.log();
  },

  events: function () {
    return this.emitter
      .on('compile', events.compile.bind(this))
      .on('done', events.done.bind(this))
      .on('request', events.request.bind(this))
      .on('start', events.start.bind(this));
  },

  sigint: function () {
    if (!this.process) return;
    this.process.on('SIGINT', this.exit);
  },

  exit: function () {
    this.peak.stop.bind(this.peak);
    if (this.process) this.process.exit();
  },

  write: function (str) {
    if (this.process) this.process.stdout.write(str);
  }

}

var events = {

  compile: function (path) {
    this.write(('compiled ' + path + '\n').yellow);
  },

  done: function () {
    this.write('done!\n'.grey);
  },

  request: function () {
    this.write(('grabbing ' + this.args.tumblr + '.tumblr.com... ').blue);
  },

  start: function (port) {
    this.write(('Server started at port ' + port + '!\n').bold.green)
  }

}
