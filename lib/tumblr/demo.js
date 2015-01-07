var Request = require('./request');

var Demo = function (session, blog, html) {
  this.session = session;
  this.blog = blog;
  this.html = html;
}

Demo.prototype = {

  fetch: function () {
    return this.session.create()
      .with(this)
      .then(this.request)
      .then(this.handle_response);
  },

  request: function () {
    var request = new Request('customize_api/demo_content/' + this.blog, { method: 'GET', json: true });
    return request.send();
  },

  handle_response: function (response) {
    if (response.statusCode == 404) {
      throw new Error(this.blog + ' is not a valid blog.');
    }
    return response.body;
  }

}

module.exports = Demo;
