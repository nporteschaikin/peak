var Compiler = require('../compiler')

  , when = require('when')
  , request = require('request').defaults({jar: true})
  , cheerio = require('cheerio');

var Deployer = function Deployer (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.compiler = new Compiler(this.peak, this.options);
}

Deployer.prototype = {

  start: function () {
    return this.get_sign_in()
      .with(this)
      .then(this.parse_sign_in)
      .then(this.sign_in)
      .then(this.get_customize)
      .then(this.get_form_key)
      .then(this.compile)
      .then(this.deploy)
      .then(this.confirm);
  },

  get_sign_in: function () {
    return this.request(url('login'), 'GET');
  },

  parse_sign_in: function (response) {
    if (response) return parse_form(response, 'signup_form', this.sign_in_params);
  },

  sign_in: function (data) {
    if (data) return this.request(url('login'), 'POST', { form: data });
  },

  get_customize: function () {
    return this.request(url('customize', this.options.blog), 'GET');
  },

  get_form_key: function (response) {
    if (response) this.form_key = element(response, 'form_key').val();
  },

  render_theme: function () {
    return this.compiler.render_file(this.options.index);
  },

  deploy: function (theme) {
    if (!theme) throw new Error(this.options.index + ' is not a valid theme.');
    return this.request(url('customize_api', 'blog', this.options.blog), 'POST', this.deploy_request_options);
  },

  confirm: function (response) {
    if (response.statusCode != 200)
      throw new Error('Please verify your credentials are correct by signing into Tumblr via their web site.');

    this.emitter.emit('finish', 'deploy to ' + this.options.blog);
  },

  request: function (uri, method, options) {
    var __this = this;

    options = options || {};
    options.method = uri;
    options.method = method;
    options.followAllRedirects = true;

    return when.promise(function(resolve, reject) {
      __this.emitter.emit('init', method + ' ' + uri);
      request(options, function(error, response) {
        if (error) reject(error);
        __this.emitter.emit('done');
        resolve(response);
      });
    });
  },

  sign_in_params: function () {
    return {
      'user[email]': this.options.email,
      'user[password]': this.options.password
    };
  },

  deploy_request_options: function (theme) {
    return {
      json: true,
      body: {
        'user_form_key': this.form_key,
        'custom_theme': theme
      }
    };
  }

}

function parse_form (response, id, attrs) {
  var el = element(response, id)
    , data = {};

  el.find('input, textarea, select, keygen').each(
    function () {
      data[this.attr('name')] = this.val();
    }
  );

  for (attr in attrs)
    data[attr] = attrs[attr];

  return data;
}

function element (response, id) {
  return cheerio(('#' + id), response.body);
}

function url () {
  return 'https://www.tumblr.com/' + Array.prototype.slice.call(arguments, 0).join('/');
}

module.exports = Deployer;
