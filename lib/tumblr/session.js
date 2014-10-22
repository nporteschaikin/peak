var Request = require('./request')
  , Browser = require('./browser')

  , when = require('when');

var Session = function (email, password) {
  this.email = email;
  this.password = password;
}

Session.prototype = {

  create: function () {
    return this.get_sign_in_form()
      .with(this)
      .then(this.sign_in);
  },

  get_sign_in_form: function () {
    var request = new Request('login', { method: 'GET' })
      , browser;

    return request.send()
      .then(function (response) {
        browser = new Browser(response.body);
        return browser.values_in_form_with_id('signup_form');
      });
  },

  sign_in: function (object) {
    var request;

    object['user[email]'] = this.email;
    object['user[password]'] = this.password;

    request = new Request('login', { method: 'POST', form: object, followAllRedirects: true });
    return request.send();
  }

}

module.exports = Session;
