var when = require('when')
  , request = require('request')

  , __jar;

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
      request.defaults({jar: Request.Jar()})(options, function (error, response, body){
        __this.error = error;
        __this.response = response;
        __this.body = body;
        if (error) reject(error);
        resolve(response);
      })
    });
  }

}

Request.Jar = function () {
  if (!__jar) __jar = request.jar();
  return __jar;
}

Request.getCookies = function (uri) {
  return Request.Jar().getCookies(uri);
}

module.exports = Request;
