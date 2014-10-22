var when = require('when')
  , req = require('request');

var Request = function (path, options) {
  this.path = path;
  this.options = options || {};
}

Request.prototype = {

  uri: function () {
    return 'https://www.tumblr.com/' +
      this.path;
  },

  send: function () {
    var __this = this
      , options;

    return when.promise(function(resolve, reject) {
      options = __this.options;
      options.uri = __this.uri();
      req.defaults({jar: true})(options, function (error, response, body){
        __this.error = error;
        __this.response = response;
        __this.body = body;
        if (error) reject(error);
        resolve(response);
      })
    });
  }

}

module.exports = Request;
