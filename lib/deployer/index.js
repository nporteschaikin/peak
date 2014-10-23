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
      .then(this.deploy);
  },

  compile: function () {
    return this.compiler.compile_file(this.options.index);
  },

  deploy: function (theme) {
    if (!theme) throw new Error(this.options.index + ' is not a valid theme.');
    return this.tumblr.update_theme(theme)
      .then(this.emitter.emit.bind(this.emitter, 'finish', 'deploying ' + this.options.blog))
  }

}

module.exports = Deployer;
