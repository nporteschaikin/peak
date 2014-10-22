var Session = require('./session')
  , Theme = require('./theme')
  , Demo = require('./demo');

var Tumblr = function (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.session = new Session(this.options.email, this.options.password);
}

Tumblr.prototype = {

  fetch_demo_content: function () {
    var demo = new Demo(this.session, this.options.blog);
    return demo.fetch();
  },

  update_theme: function (html) {
    var theme = new Theme(this.session, this.options.blog, html);
    return theme.save();
  }

}

module.exports = Tumblr;
