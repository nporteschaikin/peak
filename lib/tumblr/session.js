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
      .then(this.handle_sign_in_form)
      .then(this.sign_in)
      .then(this.handle_sign_in);
  },

  get_sign_in_form: function () {
    var request = new Request('login', { method: 'GET' })
      , browser;

    return request.send();
  },

  handle_sign_in_form: function (response) {
    browser = new Browser(response.body);
    return browser.values_in_form_with_id('signup_form');
  },

  sign_in: function (object) {
    var request;

    object['user[email]'] = this.email;
    object['user[password]'] = this.password;

    request = new Request('login', { method: 'POST', form: object, followAllRedirects: true });
    return request.send();
  },

  handle_sign_in: function (response) {
    var is_logged_in = this.is_logged_in_from_response(response);
    if (!is_logged_in) {
      throw new Error('Please verify your Tumblr credentials. ' +
        'If your credentials are correct, your account may be locked. ' +
        'To unlock your account, visit tumblr.com and sign in.');
    }

    return response;
  },

  is_logged_in_from_response: function (response) {
    var cookies;
    if (cookies = response.headers['set-cookie']) {
      for (var x=0; x<cookies.length; x++) {
        if (/^logged_in=1;/.test(cookies[x])) return true;
      }
    }
    return false;
  }

}

module.exports = Session;
