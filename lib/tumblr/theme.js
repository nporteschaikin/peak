var Request = require('./request')
  , Browser = require('./browser');

var Theme = function (session, blog, html) {
  this.session = session;
  this.blog = blog;
  this.html = html;
}

Theme.prototype = {

  save: function () {
    return this.session.create()
      .with(this)
      .then(this.get_customize_form)
      .then(this.get_form_key)
      .then(this.send_html)
      .then(this.handle_response);
  },

  get_customize_form: function () {
    var request = new Request('customize/' + this.blog, { method: 'GET' });
    return request.send();
  },

  get_form_key: function (response) {
    var browser = new Browser(response.body);
    return browser.value_of_element_with_id('form_key');
  },

  send_html: function (form_key) {
    var params = {
      'user_form_key': form_key,
      'custom_theme': this.html
    };

    var request = new Request('customize_api/blog/' + this.blog, { method: 'POST', body: JSON.stringify(params) });
    return request.send();
  },

  handle_response: function (response) {
    if (response.statusCode !== 200) {
      throw new Error('There was an error deploying your theme. '
        + 'Please try again later.');
    }

    return response;
  }

}

module.exports = Theme;
