var File = require('../compiler/file')

  , fs = require('fs')
  , when = require('when')
  , request = require('request').defaults({jar: true})
  , cheerio = require('cheerio')

  , read = fs.readFileSync;

var Deployer = function Deployer (peak, options) {
  this.peak = peak;
  this.options = options || {};
  this.emitter = peak.emitter;

  this.file = new File(this.options.index, options.compiler);
}

Deployer.prototype = {

  start: function () {
    return this.get_sign_in()
      .with(this)
      .then(this.parse_sign_in)
      .then(this.sign_in)
      .then(this.get_customize)
      .then(this.compile)
      .then(this.deploy)
      .then(this.confirm);
  },

  get_sign_in: function () {
    return this.request(url('login'), 'GET');
  },

  parse_sign_in: function (response) {
    var credentials = {
      'user[email]': this.options.email
      , 'user[password]': this.options.password
    }
    return parse_form(response, 'signup_form', credentials);
  },

  sign_in: function (data) {
    return this.request(url('login'), 'POST', { form: data });
  },

  get_customize: function () {
    return this.request(url('customize', this.options.blog), 'GET');
  },

  compile: function () {
    return this.file.compile();
  },

  deploy: function (response) {
    if (!this.file.theme) throw new Error(this.options.index + ' is not a valid theme.');
    var options = {
      json: true
      , body: {
        'user_form_key': element(response, 'form_key').val()
        , 'custom_theme': this.file.render_theme()
      }
    }
    return this.request(url('customize_api', 'blog', this.options.blog), 'POST', options);
  },

  confirm: function (response) {
    if (response.statusCode != 200) {
      throw new Error('Please verify your credentials are correct '
        + 'by signing into Tumblr via their web site.');
    }
    this.emitter.emit('misc', 'deployed', this.peak.path);
  },

  request: function (uri, method, options) {
    this.emitter.emit('init', method, uri);
    return when.promise(function (resolve, reject) {

      options = options || {};
      options.uri = uri;
      options.method = method;
      options.followAllRedirects = true;

      request(options, function (error, response) {
        if (error) reject(error);
        this.emitter.emit('done');
        resolve(response);
      }.bind(this));

    }.bind(this));
  }

}

function parse_form (response, id, attrs) {
  var el = element(response, id)
    , data = {};

  el.find('input, textarea, select, keygen').each(function () {
    data[this.attr('name')] = this.val();
  })

  for (attr in attrs) data[attr] = attrs[attr];
  return data;
}

function element (response, id) {
  return cheerio(('#' + id), response.body);
}

function url () {
  return 'https://www.tumblr.com/'
    + Array.prototype.slice.call(arguments, 0).join('/');
}

module.exports = Deployer;
