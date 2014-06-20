var when = require('when')
  , request = require('request');

var Tumblr = function (blog) {
  this.blog = blog;
  this.uri = 'http://www.tumblr.com/'
    + 'customize_api/'
    + 'demo_content/'
    + blog;
}

Tumblr.prototype = {

  fetch: function () {
    return when.promise(this.request());
  },

  request: function () {
    var __this = this;
    return function (resolve, reject, notify) {
      var options = {};
      if (!__this.blog) resolve();
      options.uri = __this.uri;
      options.json = true;

      request(options, function (error, response, body) {
        if (error) reject(error);
        __this.body = body;
        resolve(body);
      });
    }
  }

}

module.exports = Tumblr;
