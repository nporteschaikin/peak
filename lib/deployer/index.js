var Compiler = require('../compiler')
  , Tumblr = require('../tumblr')

  , when = require('when')
  , request = require('request').defaults({jar: true})
  , cheerio = require('cheerio');

var Deployer = function Deployer (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.compiler = new Compiler(this.peak, this.options);
  this.tumblr = new Tumblr(this.peak, this.options);
}

Deployer.prototype = {

  start: function () {
    return this.compile()
      .with(this)
      .then(this.deploy)
      .then(this.confirm);
  },

  compile: function () {
    return this.compiler.compile_file(this.options.index);
  },

  deploy: function (theme) {
    if (!theme) throw new Error(this.options.index + ' is not a valid theme.');
    return this.tumblr.update_theme(theme);
  },

  confirm: function (response) {
    if (response.statusCode != 200)
      throw new Error('Please verify your credentials are correct by signing into Tumblr via their web site.');

    this.emitter.emit('finish', 'deploy to ' + this.options.blog);
  }

}

module.exports = Deployer;
